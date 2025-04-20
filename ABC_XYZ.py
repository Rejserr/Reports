import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime
import calendar
import pyodbc  # Za SQL Server konekciju
import argparse

# Dodati prije glavnog koda
def parse_arguments():
    parser = argparse.ArgumentParser(description='ABC-XYZ Analysis')
    parser.add_argument('--output-dir', type=str, required=True, help='Output directory for results')
    parser.add_argument('--start-date', type=str, required=True, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end-date', type=str, required=True, help='End date (YYYY-MM-DD)')
    parser.add_argument('--warehouse-zones', type=str, help='Comma-separated list of warehouse zones')
    parser.add_argument('--item-codes', type=str, help='Comma-separated list of item codes')
    return parser.parse_args()

# Modificirati glavni kod da koristi argumente
if __name__ == "__main__":
    args = parse_arguments()
    
    # Postavke za izlazne datoteke
    output_dir = args.output_dir
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # SQL Server konekcija
    print("Povezivanje na SQL Server...")
    conn_str = (
        "DRIVER={SQL Server};"
        "SERVER=ft-AppServer01\\SQLEXPRESS;"
        "DATABASE=Reports;"
        "Trusted_Connection=yes;"
    )

    try:
        conn = pyodbc.connect(conn_str)
        print("Uspješno povezivanje na bazu.")
        
        # SQL upit za dohvat podataka iz view-a
        sql_query = """
        SELECT 
            OrderCode AS 'Broj naloga',
            OrderInputDate AS 'Datum_naloga',
            DeliveryType AS 'Vrsta isporuke',
            TaskCode AS 'Broj taska',
            ListCode AS 'Picking list',
            TaskCreateTime AS 'datum taska',
            PickDateTime AS 'Datum pikiranja',
            FromLocationCode AS 'Lokacija',
            Storage_system AS 'Zona',
            ItemCode AS 'Artikl',
            ItemName AS 'Naziv artikla',
            Qty AS 'Količina pikiranja',
            UserName AS 'Korisnik',
            Customer AS 'Kupac',
            Receiver AS 'Primatelj'
        FROM 
            [dbo].[v_pickingStorageSystem]
        WHERE 
            PickDateTime IS NOT NULL
            AND PickDateTime BETWEEN ? AND ?
        """
        
        params = [args.start_date, args.end_date]
        
        # Dodavanje filtera za zone skladišta
        if args.warehouse_zones:
            zones = args.warehouse_zones.split(',')
            placeholders = ','.join(['?' for _ in zones])
            sql_query += f" AND Storage_system IN ({placeholders})"
            params.extend(zones)
        
        # Dodavanje filtera za artikle
        if args.item_codes:
            items = args.item_codes.split(',')
            placeholders = ','.join(['?' for _ in items])
            sql_query += f" AND ItemCode IN ({placeholders})"
            params.extend(items)
        
        # Učitavanje podataka iz baze
        print("Učitavanje podataka iz baze...")
        df = pd.read_sql(sql_query, conn, params=params)
        
        # Zatvaranje konekcije
        conn.close()
        
        # Provjera učitanih podataka
        print(f"Učitano {len(df)} redaka podataka.")
        print("Dostupne kolone u podacima:")
        print(df.columns.tolist())
        
        # Mapiranje kolona za analizu
        item_col = "Artikl"
        date_col = "Datum pikiranja"
        qty_col = "Količina pikiranja"
        desc_col = "Naziv artikla"
        doc_type_col = "Vrsta isporuke"
        group_col = "Zona"
        
        # Provjera jesu li sve potrebne kolone prisutne
        missing_columns = []
        for col_name, col_var in [
            ("Artikl", item_col),
            ("Datum pikiranja", date_col),
            ("Količina pikiranja", qty_col),
            ("Naziv artikla", desc_col)
        ]:
            if col_var not in df.columns:
                missing_columns.append(col_name)
                print(f"Upozorenje: Potrebna kolona '{col_name}' nije pronađena u podacima.")
        
        if missing_columns:
            print("Greška: Nedostaju potrebne kolone za analizu.")
            exit(1)
        
        # Konverzija datuma
        if date_col in df.columns:
            print(f"Konverzija {date_col} u datetime format...")
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            
            # Izvlačenje mjeseca i godine
            df['Month'] = df[date_col].dt.month
            df['Year'] = df[date_col].dt.year
            df['MonthYear'] = df[date_col].dt.strftime('%m.%Y')
            
            print(f"Konverzija datuma uspješna. Primjer datuma: {df[date_col].head().tolist()}")
        else:
            print(f"Greška: Kolona datuma '{date_col}' nije pronađena.")
            exit(1)
        
        # Dobivanje liste jedinstvenih mjesec-godina
        month_years = sorted(df['MonthYear'].unique())
        print(f"Pronađeno {len(month_years)} jedinstvenih mjesečnih perioda.")
        
        # Dobivanje liste jedinstvenih artikala
        items = df[item_col].unique()
        print(f"Pronađeno {len(items)} jedinstvenih artikala.")
        
        # Prikaz primjera podataka nakon obrade
        print("\nPrimjer podataka nakon obrade:")
        print(df[['Month', 'Year', 'MonthYear', item_col, qty_col]].head())
        
        # Kreiranje mjesečnih pivot tablica za promet i količinu
        print("Kreiranje mjesečnih tablica...")
        turnover_pivot = pd.pivot_table(
            df, 
            values=qty_col,  # Brojat ćemo pojavljivanja ove kolone
            index=item_col, 
            columns=['MonthYear'], 
            aggfunc='count',  # Brojanje pojavljivanja umjesto zbrajanja
            fill_value=0
        )
        
        qty_pivot = pd.pivot_table(
            df, 
            values=qty_col, 
            index=item_col, 
            columns=['MonthYear'], 
            aggfunc='sum',
            fill_value=0
        )
        
        # Izračun ukupno po artiklu
        turnover_pivot['Total Turnover'] = turnover_pivot.sum(axis=1)
        qty_pivot['Total Qty'] = qty_pivot.sum(axis=1)
        
        # Kombiniranje opisa s artiklima ako je dostupno
        if desc_col in df.columns:
            # Dobivanje najčešćeg opisa za svaki artikl (u slučaju da variraju)
            item_descriptions = df.groupby(item_col)[desc_col].agg(
                lambda x: x.value_counts().index[0] if len(x.value_counts()) > 0 else ''
            ).to_dict()
        else:
            item_descriptions = {item: "" for item in items}
        
        # Dodavanje kolone zone skladišta
        if group_col in df.columns:
            # Dobivanje najčešće zone za svaki artikl
            warehouse_zones = df.groupby(item_col)[group_col].agg(
                lambda x: x.value_counts().index[0] if len(x.value_counts()) > 0 else 'TBD'
            ).to_dict()
        else:
            warehouse_zones = {item: "TBD" for item in items}
        
        # Izvođenje ABC analize
        print("Izvođenje ABC analize...")
        # Kreiranje dataframe-a s ukupnim prometom
        abc_df = pd.DataFrame({
            'Item': turnover_pivot.index,
            'Total Turnover': turnover_pivot['Total Turnover'],
            'Total Qty': qty_pivot['Total Qty']
        })
        
        # Sortiranje po prometu silazno
        abc_df = abc_df.sort_values('Total Turnover', ascending=False)
        
        # Izračun kumulativnog postotka
        abc_df['Percentage'] = 100 * abc_df['Total Turnover'] / abc_df['Total Turnover'].sum()
        abc_df['Cumulative %'] = abc_df['Percentage'].cumsum()
        
        # Dodavanje rednog broja
        abc_df['r.n.'] = range(1, len(abc_df) + 1)
        
        # Dodjeljivanje ABC kategorija
        abc_df['ABC'] = 'C'
        abc_df.loc[abc_df['Cumulative %'] <= 80, 'ABC'] = 'A'
        abc_df.loc[(abc_df['Cumulative %'] > 80) & (abc_df['Cumulative %'] <= 95), 'ABC'] = 'B'
        
        # Izvođenje XYZ analize na temelju koeficijenta varijacije
        print("Izvođenje XYZ analize...")
        # Izračun standardne devijacije i koeficijenta varijacije za svaki artikl
        xyz_df = pd.DataFrame(index=turnover_pivot.index)
        
        # Izračun mjesečne standardne devijacije i srednje vrijednosti za svaki artikl
        for item in turnover_pivot.index:
            # Dobivanje svih mjesečnih vrijednosti osim ukupne
            monthly_values = turnover_pivot.loc[item, turnover_pivot.columns != 'Total Turnover']
            
            std_dev = monthly_values.std()
            mean = monthly_values.mean()
            
            # Izbjegavanje dijeljenja s nulom
            if mean > 0:
                coef_var = (std_dev / mean) * 100
            else:
                coef_var = 0
            
            xyz_df.loc[item, 'Standard Deviation'] = std_dev
            xyz_df.loc[item, 'Coefficient Variation'] = coef_var
        
        # Dodjeljivanje XYZ kategorija
        xyz_df['XYZ'] = 'Z'
        xyz_df.loc[xyz_df['Coefficient Variation'] <= 20, 'XYZ'] = 'X'
        xyz_df.loc[(xyz_df['Coefficient Variation'] > 20) & (xyz_df['Coefficient Variation'] <= 40), 'XYZ'] = 'Y'
        
        # Kombiniranje ABC i XYZ rezultata
        print("Kombiniranje ABC i XYZ analiza...")
        combined_df = abc_df.set_index('Item')
        combined_df['Standard Deviation'] = xyz_df['Standard Deviation']
        combined_df['Coefficient Variation'] = xyz_df['Coefficient Variation']
        combined_df['XYZ'] = xyz_df['XYZ']
        combined_df['Name'] = combined_df.index.map(item_descriptions)
        combined_df['Warehouse zone'] = combined_df.index.map(warehouse_zones)
        combined_df['Active'] = 'TRUE'  # Pretpostavljamo da su svi artikli aktivni
        
        # Kreiranje kompletne mjesečne tablice
        print("Kreiranje konačne mjesečne tablice...")
        final_df = combined_df.copy()
        
        # Osiguravanje da su Total Turnover i Total Qty u final_df
        final_df['Total Turnover'] = combined_df['Total Turnover']
        final_df['Total Qty'] = combined_df['Total Qty']
        
        # Dodavanje mjesečnih kolona za promet i količinu
        for month in turnover_pivot.columns:
            if month != 'Total Turnover':
                final_df[f'Turnover_{month}'] = turnover_pivot[month]
                final_df[f'QTY_{month}'] = qty_pivot[month]
        
        # Preuređivanje kolona prema traženom formatu
        column_order = ['Name', 'Warehouse zone', 'ABC', 'XYZ', 'Total Turnover', 'Total Qty']
        
        # Dodavanje mjesečnih kolona u parovima (Turnover i QTY)
        for month in [col for col in turnover_pivot.columns if col != 'Total Turnover']:
            column_order.extend([f'Turnover_{month}', f'QTY_{month}'])
        
        # Osiguravanje da sve kolone postoje
        final_columns = [col for col in column_order if col in final_df.columns]
        
        # Preuređivanje kolona
        final_df = final_df[final_columns]
        
        # Spremanje rezultata
        print("Spremanje rezultata...")
        final_file = os.path.join(output_dir, 'abc_xyz_monthly_breakdown.xlsx')
        
        # Kreiranje Pandas Excel writer-a
        writer = pd.ExcelWriter(final_file, engine='xlsxwriter')
        
        # Pisanje podataka u Excel
        final_df.to_excel(writer, sheet_name='Monthly Breakdown', index=True)
        
        # Dobivanje workbook i worksheet objekata
        workbook = writer.book
        worksheet = writer.sheets['Monthly Breakdown']
        
        # Dodavanje formatiranja
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'bg_color': '#D9E1F2',
            'border': 1
        })
        
        # Formatiranje boja za ABC kategorije
        format_a = workbook.add_format({'bg_color': '#90EE90'})  # Svijetlo zelena
        format_b = workbook.add_format({'bg_color': '#FFFFE0'})  # Svijetlo žuta
        format_c = workbook.add_format({'bg_color': '#FFC0CB'})  # Svijetlo ružičasta
        
        # Primjena formatiranja zaglavlja
        for col_num, value in enumerate(final_df.columns.values):
            worksheet.write(0, col_num + 1, value, header_format)
        worksheet.write(0, 0, 'Item', header_format)
        
        # Primjena uvjetnog formatiranja za ABC kolonu
        abc_col = final_columns.index('ABC') + 1
        worksheet.conditional_format(1, abc_col, len(final_df) + 1, abc_col, 
                                    {'type': 'cell',
                                     'criteria': '==',
                                     'value': '"A"',
                                     'format': format_a})
                                 
        worksheet.conditional_format(1, abc_col, len(final_df) + 1, abc_col, 
                                    {'type': 'cell',
                                     'criteria': '==',
                                     'value': '"B"',
                                     'format': format_b})
                                 
        worksheet.conditional_format(1, abc_col, len(final_df) + 1, abc_col, 
                                    {'type': 'cell',
                                     'criteria': '==',
                                     'value': '"C"',
                                     'format': format_c})
        
        # Kreiranje sažetka
        # Izračun sažetaka
        abc_summary = final_df.groupby('ABC').agg({
            'Total Turnover': 'sum',
            'Total Qty': 'sum'
        }).reset_index()
        
            # Izračun postotaka direktno
        abc_count_series = final_df.groupby('ABC').size()
        abc_summary['Item Count'] = abc_count_series.values
        abc_summary['% of Items'] = abc_summary['Item Count'] / len(final_df) * 100
        abc_summary['% of Turnover'] = abc_summary['Total Turnover'] / abc_summary['Total Turnover'].sum() * 100
        abc_summary['% of Quantity'] = abc_summary['Total Qty'] / abc_summary['Total Qty'].sum() * 100

        xyz_summary = final_df.groupby('XYZ').agg({
            'Total Turnover': 'sum',
            'Total Qty': 'sum'
        }).reset_index()

        # Izračun postotaka direktno
        xyz_count_series = final_df.groupby('XYZ').size()
        xyz_summary['Item Count'] = xyz_count_series.values
        xyz_summary['% of Items'] = xyz_summary['Item Count'] / len(final_df) * 100
        xyz_summary['% of Turnover'] = xyz_summary['Total Turnover'] / xyz_summary['Total Turnover'].sum() * 100
        xyz_summary['% of Quantity'] = xyz_summary['Total Qty'] / xyz_summary['Total Qty'].sum() * 100

        # Izračun kombiniranog ABC-XYZ sažetka
        combined_summary = final_df.groupby(['ABC', 'XYZ']).agg({
            'Total Turnover': 'sum',
            'Total Qty': 'sum'
        }).reset_index()

        # Izračun veličina grupa
        group_sizes = final_df.groupby(['ABC', 'XYZ']).size().reset_index(name='Item Count')
        combined_summary = combined_summary.merge(group_sizes, on=['ABC', 'XYZ'], how='left')

        # Izračun postotaka nakon spajanja
        combined_summary['% of Items'] = combined_summary['Item Count'] / len(final_df) * 100
        combined_summary['% of Turnover'] = combined_summary['Total Turnover'] / combined_summary['Total Turnover'].sum() * 100
        combined_summary['% of Quantity'] = combined_summary['Total Qty'] / combined_summary['Total Qty'].sum() * 100

        # Kreiranje vizualizacijskih listova
        # ABC histogram
        plt.figure(figsize=(10, 6))
        abc_counts = final_df['ABC'].value_counts().sort_index()
        bars = plt.bar(abc_counts.index, abc_counts.values, color=['green', 'yellow', 'red'])
        plt.title('ABC Classification Distribution')
        plt.xlabel('Category')
        plt.ylabel('Number of Items')
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height}\n({height/len(final_df):.1%})',
                    ha='center', va='bottom')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'abc_distribution.png'))
        plt.close()

        # XYZ histogram
        plt.figure(figsize=(10, 6))
        xyz_counts = final_df['XYZ'].value_counts().sort_index()
        bars = plt.bar(xyz_counts.index, xyz_counts.values, color=['blue', 'orange', 'purple'])
        plt.title('XYZ Classification Distribution')
        plt.xlabel('Category')
        plt.ylabel('Number of Items')
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height}\n({height/len(final_df):.1%})',
                    ha='center', va='bottom')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'xyz_distribution.png'))
        plt.close()

        # ABC-XYZ matrica
        plt.figure(figsize=(12, 8))
        abcxyz_counts = final_df.groupby(['ABC', 'XYZ']).size().unstack(fill_value=0)
        cax = plt.matshow(abcxyz_counts, fignum=1, cmap='YlGnBu')
        plt.colorbar(cax)
        plt.title('ABC-XYZ Matrix')
        plt.xlabel('XYZ Classification')
        plt.ylabel('ABC Classification')

        # Dodavanje tekstualnih anotacija
        for i in range(abcxyz_counts.shape[0]):
            for j in range(abcxyz_counts.shape[1]):
                plt.text(j, i, f'{abcxyz_counts.iloc[i, j]}\n({abcxyz_counts.iloc[i, j]/len(final_df):.1%})', 
                         ha='center', va='center')

        plt.xticks(range(len(abcxyz_counts.columns)), abcxyz_counts.columns)
        plt.yticks(range(len(abcxyz_counts.index)), abcxyz_counts.index)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'abcxyz_matrix.png'))
        plt.close()

            # Pareto dijagram za ABC klasifikaciju
        plt.figure(figsize=(14, 8))
        sorted_items = final_df.sort_values('Total Turnover', ascending=False).reset_index()
        # Izračun kumulativnog postotka direktno u sorted_items DataFrame-u
        sorted_items['Percentage'] = 100 * sorted_items['Total Turnover'] / sorted_items['Total Turnover'].sum()
        sorted_items['Cumulative %'] = sorted_items['Percentage'].cumsum()
        
        # Kreiranje figure s dva y-osi
        fig, ax1 = plt.subplots(figsize=(14, 8))
        
        # Prva y-os za turnover (stupići)
        ax1.bar(range(len(sorted_items)), sorted_items['Total Turnover'], color='skyblue', alpha=0.7)
        ax1.set_xlabel('Items ranked by turnover')
        ax1.set_ylabel('Turnover', color='royalblue')
        ax1.tick_params(axis='y', labelcolor='royalblue')
        
        # Druga y-os za kumulativni postotak (linija)
        ax2 = ax1.twinx()
        ax2.plot(range(len(sorted_items)), sorted_items['Cumulative %'], 'r-', marker='o', markersize=3, linewidth=2)
        ax2.set_ylabel('Cumulative percentage (%)', color='red')
        ax2.tick_params(axis='y', labelcolor='red')
        
        # Postavljanje granice za y2 os od 0 do 100%
        ax2.set_ylim([0, 100])
        
        # Dodavanje linija za granice 80% i 95%
        ax2.axhline(y=80, color='g', linestyle='--', label='80% threshold (A items)')
        ax2.axhline(y=95, color='orange', linestyle='--', label='95% threshold (B items)')
        
        # Dodavanje naslova i legende
        plt.title('ABC Analysis - Pareto Chart', fontsize=14, fontweight='bold')
        
        # Kreiranje kombinirane legende za obje osi
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax2.legend(lines1 + lines2, labels1 + labels2, loc='upper left', bbox_to_anchor=(0.01, 0.99))
        
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'abc_pareto.png'), dpi=300)
        plt.close()


        # Mjesečna analiza trenda za top 10 artikala
        plt.figure(figsize=(15, 10))
        top_items = sorted_items['Item'].head(10)
        for item in top_items:
            # Dobivanje mjesečnih podataka o prometu (isključujući ukupno)
            monthly_data = [turnover_pivot.loc[item, col] for col in turnover_pivot.columns if col != 'Total Turnover']
            months = [col for col in turnover_pivot.columns if col != 'Total Turnover']
            plt.plot(months, monthly_data, marker='o', label=f"{item} - {item_descriptions.get(item, '')[:20]}")

        plt.title('Monthly Turnover Trend for Top 10 Items')
        plt.xlabel('Month')
        plt.ylabel('Turnover')
        plt.xticks(rotation=45)
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'top_items_trend.png'))
        plt.close()

        # Dodavanje slika u Excel radnu knjigu
        worksheet = workbook.add_worksheet('Visualizations')
        image_files = [
            os.path.join(output_dir, 'abc_distribution.png'),
            os.path.join(output_dir, 'xyz_distribution.png'),
            os.path.join(output_dir, 'abcxyz_matrix.png'),
            os.path.join(output_dir, 'abc_pareto.png'),
            os.path.join(output_dir, 'top_items_trend.png')
        ]

        # Dodavanje slika u radni list
        for i, image_file in enumerate(image_files):
            worksheet.insert_image(i*25, 1, image_file, {'x_scale': 0.7, 'y_scale': 0.7})
            worksheet.write(i*25 + 22, 1, f"Figure {i+1}: {os.path.basename(image_file).replace('.png', '')}")

        # Kreiranje dodatnog radnog lista s uvidima
        worksheet = workbook.add_worksheet('Analiza & Preporuka')

        # Pisanje zaglavlja sekcija i preporuka
        worksheet.write(0, 0, 'ABC-XYZ analiza: uvid u podatke i preporuke', workbook.add_format({'bold': True, 'font_size': 14}))

        # Preporuke za artikle kategorije A
        worksheet.write(2, 0, 'Artikli kategorije A', workbook.add_format({'bold': True}))
        worksheet.write(3, 0, 'Ovi artikli čine približno 80% vašeg prometa. Preporuke:')
        worksheet.write(4, 0, '1. Osigurajte visoku dostupnost i minimizirajte nestašice zaliha')
        worksheet.write(5, 0, '2. Postavite ih na komisione lokacije za slaganje (u visini očiju, blizu izlaznih zona)')
        worksheet.write(6, 0, '3. Razmislite o posebnim zonama za komisioniranje ovih artikala')
        worksheet.write(7, 0, '4. Provodite redovne inventure i redovite provjere zalihe')

        # Preporuke za artikle kategorije B
        worksheet.write(9, 0, 'Artikli kategorije B', workbook.add_format({'bold': True}))
        worksheet.write(10, 0, 'Ovi artikli čine približno 15% vašeg prometa. Preporuke:')
        worksheet.write(11, 0, '1. Održavajte umjerene razine zaliha')
        worksheet.write(12, 0, '2. Postavite ih na sekundarne lokacije s razumnim pristupom')
        worksheet.write(13, 0, '3. Primjenjujte standardne postupke kontrole zaliha')

        # Preporuke za artikle kategorije C
        worksheet.write(15, 0, 'Artikli kategorije C', workbook.add_format({'bold': True}))
        worksheet.write(16, 0, 'Ovi artikli čine približno 5% vašeg prometa. Preporuke:')
        worksheet.write(17, 0, '1. Smanjite ulaganje u zalihe')
        worksheet.write(18, 0, '2. Razmotrite rjeđe narudžbe s većim količinama')
        worksheet.write(19, 0, '3. Skladištite ih na udaljenim lokacijama')
        worksheet.write(20, 0, '4. Procijenite spore artikle za moguće uklanjanje')

        # Preporuke za XYZ klasifikaciju
        worksheet.write(22, 0, 'Preporuke za XYZ klasifikaciju', workbook.add_format({'bold': True}))
        worksheet.write(23, 0, 'X artikli: Linearna izlaznost - Pogodni za automatizirane sustave nadopune')
        worksheet.write(24, 0, 'Y artikli: Umjerene fluktuacije - Potreban sigurnosni lager i pažljivo planiranje')
        worksheet.write(25, 0, 'Z artikli: Neredovita izlaznost - Razmotriti posebnu obradu, ručni pregled narudžbi')

        # Kombinirana ABC-XYZ strategija
        worksheet.write(27, 0, 'Kombinirana ABC-XYZ strategija', workbook.add_format({'bold': True}))
        worksheet.write(28, 0, 'AX: Visoka vrijednost, stabilna potražnja - Fokus na efikasnost, JIT isporuka, premium lokacije')
        worksheet.write(29, 0, 'AY/AZ: Visoka vrijednost, promjenjiva potražnja - Blisko praćenje, sigurnosni lager, redoviti pregledi')
        worksheet.write(30, 0, 'BX: Srednja vrijednost, stabilna potražnja - Standardni procesi, umjerene razine zaliha')
        worksheet.write(31, 0, 'CZ: Niska vrijednost, neredovita potražnja - Minimalna pažnja, razmotriti vanjsko skladištenje ili nabavu na veliko')

        # Kreiranje prilagođenih skladišnih izvještaja
        worksheet = workbook.add_worksheet('Warehouse Optimization')
        worksheet.write(0, 0, 'Warehouse Optimization Suggestions', workbook.add_format({'bold': True, 'font_size': 14}))

        # A artikli u skladištu
        a_items_df = final_df[final_df['ABC'] == 'A'].sort_values('Total Turnover', ascending=False)
        worksheet.write(2, 0, 'Top A Items for Prime Locations', workbook.add_format({'bold': True}))
        worksheet.write(3, 0, 'Item')
        worksheet.write(3, 1, 'Description')
        worksheet.write(3, 2, 'Total Turnover')
        worksheet.write(3, 3, 'XYZ Class')
        worksheet.write(3, 4, 'Suggested Location')

        for i, (idx, row) in enumerate(a_items_df.head(20).iterrows()):
            worksheet.write(i+4, 0, idx)  # Item code
            worksheet.write(i+4, 1, row['Name'])  # Description
            worksheet.write(i+4, 2, row['Total Turnover'])
            worksheet.write(i+4, 3, row['XYZ'])
            
            # Predložena lokacija na temelju XYZ klase
            if row['XYZ'] == 'X':
                suggestion = 'Primary pick face, ground level'
            elif row['XYZ'] == 'Y':
                suggestion = 'Primary pick face, middle level'
            else:
                suggestion = 'Primary pick face, with buffer stock'
            
            worksheet.write(i+4, 4, suggestion)

            # Dodatni izvještaji za uvide
        # Mjesečni obrasci prodaje
        worksheet.write(30, 0, 'Monthly Sales Patterns (A Items)', workbook.add_format({'bold': True}))
        worksheet.write(31, 0, 'Month')

        month_columns = [col for col in turnover_pivot.columns if col != 'Total Turnover']
        for i, month in enumerate(month_columns):
            worksheet.write(31, i+1, month)

        total_monthly = []
        for month in month_columns:
            total_monthly.append(turnover_pivot[month].sum())

        worksheet.write(32, 0, 'Total Turnover')
        for i, total in enumerate(total_monthly):
            worksheet.write(32, i+1, total)

        # Izračun min/max količina na temelju ABC-XYZ klasifikacije
        print("Izračun min/max količina zaliha...")

        # Definiranje parametara (ovi bi mogli biti konfigurabilni)
        lead_time_weeks = 2  # Primjer: 2 tjedna vremena isporuke za nadopunu
        safety_stock_factors = {
            'X': 1.0,  # Niži sigurnosni lager za stabilne artikle
            'Y': 1.5,  # Srednji sigurnosni lager za umjerene varijacije
            'Z': 2.5   # Viši sigurnosni lager za nepredvidljive artikle
        }

        # ABC faktori za izračun maksimalnih količina
        max_qty_factors = {
            'A': 1.5,  # Niži plafon zaliha za važne artikle (brža nadopuna)
            'B': 2.0,  # Srednji plafon zaliha
            'C': 3.0   # Viši plafon zaliha za manje važne artikle (rjeđe narudžbe)
        }

        # Tjedni izračuni
        weeks_per_month = 4.33  # Prosječan broj tjedana po mjesecu

        # Za mjesečne podatke, koristimo zadnjih n mjeseci (ako su dostupni)
        analysis_months = [col for col in turnover_pivot.columns if col != 'Total Turnover']
        if len(analysis_months) > 0:
            # Koristimo prosječnu mjesečnu potrošnju za izračun tjednog prosjeka
            final_df['Avg Monthly Qty'] = final_df[[f'QTY_{month}' for month in analysis_months]].mean(axis=1)
            final_df['Avg Weekly Qty'] = final_df['Avg Monthly Qty'] / weeks_per_month
            
            # Izračun standardne devijacije za sigurnosni lager
            if len(analysis_months) > 1:
                final_df['Monthly Qty StdDev'] = final_df[[f'QTY_{month}' for month in analysis_months]].std(axis=1)
                final_df['Weekly Qty StdDev'] = final_df['Monthly Qty StdDev'] / weeks_per_month
            else:
                # Ako imamo samo jedan mjesec, koristimo koeficijent varijacije iz XYZ analize
                final_df['Weekly Qty StdDev'] = final_df['Avg Weekly Qty'] * final_df['Coefficient Variation'] / 100

            # Izračun tjednih min/max količina
            final_df['Safety Stock Weekly'] = final_df.apply(
                lambda row: max(row['Weekly Qty StdDev'] * safety_stock_factors[row['XYZ']], 
                                row['Avg Weekly Qty'] * 0.2),  # Minimalni sigurnosni lager je 20% prosjeka
                axis=1
            )
            
            final_df['Min Qty Weekly'] = final_df['Avg Weekly Qty'] * lead_time_weeks + final_df['Safety Stock Weekly']
            final_df['Max Qty Weekly'] = final_df.apply(
                lambda row: row['Min Qty Weekly'] + row['Avg Weekly Qty'] * max_qty_factors[row['ABC']], 
                axis=1
            )
            
            # Izračun mjesečnih min/max količina
            final_df['Min Qty Monthly'] = final_df['Min Qty Weekly'] * weeks_per_month
            final_df['Max Qty Monthly'] = final_df['Max Qty Weekly'] * weeks_per_month
            
            # Zaokruživanje količina na cijele brojeve za cijele jedinice ili na 2 decimale za djelomične jedinice
            for col in ['Min Qty Weekly', 'Max Qty Weekly', 'Min Qty Monthly', 'Max Qty Monthly']:
                # Koristimo različitu logiku zaokruživanja na temelju veličine prosječne količine
                final_df[col] = final_df.apply(
                    lambda row: round(row[col]) if row['Avg Weekly Qty'] > 5 else round(row[col], 2),
                    axis=1
                )
            
            # Dodavanje ovih kolona u naš column_order za prikaz
            inventory_columns = ['Avg Weekly Qty', 'Min Qty Weekly', 'Max Qty Weekly', 
                                 'Avg Monthly Qty', 'Min Qty Monthly', 'Max Qty Monthly']
            
            for col in inventory_columns:
                if col not in column_order:
                    column_order.append(col)
            
            # Kreiranje zasebnog radnog lista za upravljanje zalihama
            inventory_worksheet = workbook.add_worksheet('Inventory Management')
            inventory_worksheet.write(0, 0, 'Inventory Planning Based on ABC-XYZ Analysis', 
                                     workbook.add_format({'bold': True, 'font_size': 14}))
            
            # Pisanje zaglavlja
            headers = ['Item', 'Description', 'ABC', 'XYZ', 'Avg Weekly Qty', 
                       'Min Qty Weekly', 'Max Qty Weekly', 'Avg Monthly Qty', 
                       'Min Qty Monthly', 'Max Qty Monthly']
            
            for i, header in enumerate(headers):
                inventory_worksheet.write(2, i, header, header_format)
            
            # Sortiranje artikala po ABC, zatim XYZ
            sorted_inventory = final_df.reset_index().sort_values(['ABC', 'XYZ'])
            
            # Pisanje podataka
            for row_idx, (_, row) in enumerate(sorted_inventory.iterrows(), start=3):
                inventory_worksheet.write(row_idx, 0, row['Item'])
                inventory_worksheet.write(row_idx, 1, row['Name'])
                inventory_worksheet.write(row_idx, 2, row['ABC'])
                inventory_worksheet.write(row_idx, 3, row['XYZ'])
                inventory_worksheet.write(row_idx, 4, row['Avg Weekly Qty'])
                inventory_worksheet.write(row_idx, 5, row['Min Qty Weekly'])
                inventory_worksheet.write(row_idx, 6, row['Max Qty Weekly'])
                inventory_worksheet.write(row_idx, 7, row['Avg Monthly Qty'])
                inventory_worksheet.write(row_idx, 8, row['Min Qty Monthly'])
                inventory_worksheet.write(row_idx, 9, row['Max Qty Monthly'])
            
            # Zamrzavanje retka zaglavlja
            inventory_worksheet.freeze_panes(3, 0)
            
            # Dodavanje uvjetnog formatiranja
            for col in range(2, 4):  # ABC i XYZ kolone
                inventory_worksheet.conditional_format(3, col, row_idx, col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"A"',
                                         'format': format_a})
                inventory_worksheet.conditional_format(3, col, row_idx, col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"B"',
                                         'format': format_b})
                inventory_worksheet.conditional_format(3, col, row_idx, col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"C"',
                                         'format': format_c})    

        # Spremanje Excel datoteke
        writer.close()

        print(f"Analiza završena! Rezultati spremljeni u {final_file}")
        print("Dodatne analize koje bi mogle biti korisne:")
        print("1. Sezonska analiza za identifikaciju vršnih perioda")
        print("2. Analiza performansi dobavljača za optimizaciju naručivanja")
        print("3. Analiza korelacije artikala za optimizaciju rasporeda skladišta")
        print("4. Analiza točnosti predviđanja za poboljšanje planiranja zaliha")

        # Kreiranje zasebnog izvještaja za artikle koji trebaju pažnju
        attention_items = final_df[(final_df['ABC'] == 'A') & (final_df['XYZ'] == 'Z')]
        if not attention_items.empty:
            attention_file = os.path.join(output_dir, 'items_needing_attention.xlsx')
            attention_items.to_excel(attention_file, index=True)
            print(f"Artikli koji trebaju posebnu pažnju (AZ kategorija) spremljeni u {attention_file}")

    except Exception as e:
        print(f"Došlo je do greške: {str(e)}")
        import traceback
        traceback.print_exc()

        # Dodajte novi try-except blok za ABC po zonama
    try:
        # Dodatna analiza - ABC po zonama skladišta
        print("Izvođenje ABC analize po zonama skladišta...")
        
        # Dobivanje jedinstvenih zona
        unique_zones = sorted(final_df['Warehouse zone'].unique())
        print(f"Pronađeno {len(unique_zones)} jedinstvenih zona skladišta.")
        
        # Kreiranje novog Excel izvještaja za ABC po zonama
        zones_file = os.path.join(output_dir, 'abc_by_zone.xlsx')
        zones_writer = pd.ExcelWriter(zones_file, engine='xlsxwriter')

        # Dodatna analiza - ABC po zonama skladišta
        print("Izvođenje ABC analize po zonama skladišta...")
        
        # Dobivanje jedinstvenih zona
        unique_zones = sorted(final_df['Warehouse zone'].unique())
        print(f"Pronađeno {len(unique_zones)} jedinstvenih zona skladišta.")
        
        # Kreiranje novog Excel izvještaja za ABC po zonama
        zones_file = os.path.join(output_dir, 'abc_by_zone.xlsx')
        zones_writer = pd.ExcelWriter(zones_file, engine='xlsxwriter')
        
        # Kreiranje radnog lista sa sažetkom svih zona
        zone_summary_df = pd.DataFrame({
            'Zone': unique_zones,
            'Item Count': [len(final_df[final_df['Warehouse zone'] == zone]) for zone in unique_zones]
        })
        
        # Dodavanje broja artikala po ABC kategoriji za svaku zonu
        for abc_cat in ['A', 'B', 'C']:
            zone_summary_df[f'{abc_cat} Items'] = [
                len(final_df[(final_df['Warehouse zone'] == zone) & (final_df['ABC'] == abc_cat)]) 
                for zone in unique_zones
            ]
            zone_summary_df[f'{abc_cat} %'] = zone_summary_df[f'{abc_cat} Items'] / zone_summary_df['Item Count'] * 100
        
        # Dodavanje ukupnog prometa po zoni
        zone_summary_df['Total Turnover'] = [
            final_df[final_df['Warehouse zone'] == zone]['Total Turnover'].sum() 
            for zone in unique_zones
        ]
        
        # Sortiranje po ukupnom prometu
        zone_summary_df = zone_summary_df.sort_values('Total Turnover', ascending=False)
        
        # Spremanje sažetka u Excel
        zone_summary_df.to_excel(zones_writer, sheet_name='Zone Summary', index=False)
        
        # Dobivanje workbook objekta za formatiranje
        workbook = zones_writer.book
        
        # Formatiranje za zaglavlja
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'bg_color': '#D9E1F2',
            'border': 1
        })
        
        # Formatiranje za ABC kategorije
        format_a = workbook.add_format({'bg_color': '#90EE90'})  # Svijetlo zelena
        format_b = workbook.add_format({'bg_color': '#FFFFE0'})  # Svijetlo žuta
        format_c = workbook.add_format({'bg_color': '#FFC0CB'})  # Svijetlo ružičasta
        
        # Za svaku zonu, napraviti zasebnu ABC analizu
        for zone in unique_zones:
            # Filtriranje podataka samo za ovu zonu
            zone_df = final_df[final_df['Warehouse zone'] == zone].copy()
            
            # Preskočiti zone s premalo artikala
            if len(zone_df) < 5:
                print(f"Preskačem zonu {zone} jer ima samo {len(zone_df)} artikala.")
                continue
            
            print(f"Analiziram zonu: {zone} ({len(zone_df)} artikala)")
            
            # Resetiranje indeksa za sortiranje
            zone_df = zone_df.reset_index()
            
            # Sortiranje po prometu silazno
            zone_df = zone_df.sort_values('Total Turnover', ascending=False)
            
            # Izračun kumulativnog postotka unutar zone
            zone_df['Zone Percentage'] = 100 * zone_df['Total Turnover'] / zone_df['Total Turnover'].sum()
            zone_df['Zone Cumulative %'] = zone_df['Zone Percentage'].cumsum()
            
            # Dodjeljivanje ABC kategorija specifično za ovu zonu
            zone_df['Zone ABC'] = 'C'
            zone_df.loc[zone_df['Zone Cumulative %'] <= 80, 'Zone ABC'] = 'A'
            zone_df.loc[(zone_df['Zone Cumulative %'] > 80) & (zone_df['Zone Cumulative %'] <= 95), 'Zone ABC'] = 'B'
            
            # Dodavanje rednog broja
            zone_df['Zone Rank'] = range(1, len(zone_df) + 1)
            
            # Odabir kolona za izvještaj
            zone_columns = ['Item', 'Name', 'ABC', 'Zone ABC', 'XYZ', 'Total Turnover', 'Total Qty', 
                            'Zone Percentage', 'Zone Cumulative %', 'Zone Rank']
            
            # Spremanje u Excel
            zone_df[zone_columns].to_excel(zones_writer, sheet_name=f'Zone_{zone[:30]}', index=False)
            
            # Dobivanje worksheet objekta za formatiranje
            worksheet = zones_writer.sheets[f'Zone_{zone[:30]}']
            
            # Primjena formatiranja zaglavlja
            for col_num, value in enumerate(zone_columns):
                worksheet.write(0, col_num, value, header_format)
            
            # Primjena uvjetnog formatiranja za ABC kolonu
            abc_col = zone_columns.index('ABC')
            worksheet.conditional_format(1, abc_col, len(zone_df) + 1, abc_col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"A"',
                                         'format': format_a})
            worksheet.conditional_format(1, abc_col, len(zone_df) + 1, abc_col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"B"',
                                         'format': format_b})
            worksheet.conditional_format(1, abc_col, len(zone_df) + 1, abc_col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"C"',
                                         'format': format_c})
            
            # Primjena uvjetnog formatiranja za Zone ABC kolonu
            zone_abc_col = zone_columns.index('Zone ABC')
            worksheet.conditional_format(1, zone_abc_col, len(zone_df) + 1, zone_abc_col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"A"',
                                         'format': format_a})
            worksheet.conditional_format(1, zone_abc_col, len(zone_df) + 1, zone_abc_col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"B"',
                                         'format': format_b})
            worksheet.conditional_format(1, zone_abc_col, len(zone_df) + 1, zone_abc_col, 
                                        {'type': 'cell',
                                         'criteria': '==',
                                         'value': '"C"',
                                         'format': format_c})
        
        # Kreiranje radnog lista s usporedbom ABC kategorija (globalno vs. po zoni)
        comparison_data = []
        for zone in unique_zones:
            zone_df = final_df[final_df['Warehouse zone'] == zone].copy()
            if len(zone_df) < 5:
                continue
            
            # Resetiranje indeksa za sortiranje
            zone_df = zone_df.reset_index()
            
            # Sortiranje po prometu silazno
            zone_df = zone_df.sort_values('Total Turnover', ascending=False)
            
            # Izračun kumulativnog postotka unutar zone
            zone_df['Zone Percentage'] = 100 * zone_df['Total Turnover'] / zone_df['Total Turnover'].sum()
            zone_df['Zone Cumulative %'] = zone_df['Zone Percentage'].cumsum()
            
            # Dodjeljivanje ABC kategorija specifično za ovu zonu
            zone_df['Zone ABC'] = 'C'
            zone_df.loc[zone_df['Zone Cumulative %'] <= 80, 'Zone ABC'] = 'A'
            zone_df.loc[(zone_df['Zone Cumulative %'] > 80) & (zone_df['Zone Cumulative %'] <= 95), 'Zone ABC'] = 'B'
            
            # Usporedba globalne ABC kategorije i ABC kategorije po zoni
            for abc_global in ['A', 'B', 'C']:
                for abc_zone in ['A', 'B', 'C']:
                    count = len(zone_df[(zone_df['ABC'] == abc_global) & (zone_df['Zone ABC'] == abc_zone)])
                    if count > 0:
                        comparison_data.append({
                            'Zone': zone,
                            'Global ABC': abc_global,
                            'Zone ABC': abc_zone,
                            'Item Count': count,
                            'Percentage': count / len(zone_df) * 100
                        })
        
        # Kreiranje DataFrame-a za usporedbu
        comparison_df = pd.DataFrame(comparison_data)
        
        # Spremanje u Excel
        if not comparison_df.empty:
            comparison_df.to_excel(zones_writer, sheet_name='ABC Comparison', index=False)
        
        # Spremanje Excel datoteke
        zones_writer.close()
        
        print(f"ABC analiza po zonama spremljena u {zones_file}")
    except Exception as e:
        print(f"Greška pri kreiranju ABC analize po zonama: {str(e)}")
        import traceback
        traceback.print_exc()
