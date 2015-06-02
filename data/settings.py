# -*- coding: utf-8 -*-

# Files to read.

# JSON file of country_name to iso-3166 alpha 2 codes.
DEFAULT_ISOFILE = 'country_to_iso3166.json'

# XLS file of last survey questions.
DEFAULT_QUESTIONFILE = 'OBS2012_QuestionsNumbers+Text.xlsx'
# Name of sheet with survey questions from the previous file.
QUESTIONFILE_SHEETNAME = 'Sheet2'

# XLS file of all survey answers.
DEFAULT_ANSWERFILE = 'OBI_UNIFIED.xlsx'
# Name of sheet with survey answers from the previous file.
ANSWERFILE_SHEETNAME = 'Sheet1'

# XLS file of question groupings and country groupings.
DEFAULT_GROUPINGSFILE = 'GroupingsOBSQuestions2012_102112.xlsx'
# Name of sheet with question groupings from the previous file.
GROUPINGSFILE_QUESTIONS_SHEETNAME = 'QuestionsGroups'
# Name of sheet with country groupings from the previous file.
GROUPINGSFILE_COUNTRIES_SHEETNAME = 'CountriesRegions'

# XLS file of 'Public Availability' dataset.
DEFAULT_AVAILABILITYFILE = 'Public Availability All Years.xlsx'
# Name of sheets with 'Public Availability' data from the previous file.
AVAILABILITYFILE_SHEETNAMES = ['2006','2008','2010','2012']

# Files to write.

# Output filename to write with all above data.
DEFAULT_OUTPUT = '../vendor/ibp_dataset.js'
# Folder to store downloadable DB.
DEFAULT_DOWNLOADFOLDER = '../app/assets/downloads/'
# Downloadable XLS file.
FILENAME_XLSX = 'ibp_data.xlsx'
# Downloadable CSV file.
FILENAME_CSV = 'ibp_data_%s.csv'
# Downloadable ZIP file.
FILENAME_CSV_ZIP = 'ibp_data_csv.zip'
# Downloadable JSON file.
FILENAME_JSON = 'ibp_data.json'

# List of survey years.
YEARS = [2006,2008,2010,2012,2012]