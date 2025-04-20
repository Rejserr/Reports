USE [Reports]
GO

DECLARE @YesterdayDate VARCHAR(10)
SET @YesterdayDate = CONVERT(VARCHAR(10), DATEADD(DAY, -1, GETDATE()), 120) -- Format YYYY-MM-DD

PRINT 'Pokretanje importa za datum: ' + @YesterdayDate

EXEC [dbo].[sp_Import_Picking]
    @StartDate = @YesterdayDate,
    @EndDate = @YesterdayDate
GO
