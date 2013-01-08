import openpyxl
import unicodecsv
import os
import json
import csv
import zipfile

FILENAME_XLSX = 'ibp_data.xlsx'
FILENAME_CSV = 'ibp_data_%s.csv'
FILENAME_CSV_ZIP = 'ibp_data_csv.zip'
FILENAME_JSON = 'ibp_data.json'

def write(dataset, iso_data, jsonfilename, downloadfoldername):
    # Populate the downloads folder
    # -----------------------------
    # Import all data
    print 'Importing all data...'
    Q_HEADERS, Q_DATA = _questions_as_csv(dataset)
    G_HEADERS, G_DATA = _groupings_as_csv(dataset)
    CN_HEADERS, CN_DATA = _countrynames_as_csv(dataset,iso_data)
    R_HEADERS, R_DATA = _regions_as_csv(dataset)
    S_HEADERS, S_DATA = _scores_as_csv(dataset)
    SM_HEADERS, SM_DATA = _summary_as_csv(dataset)
    # Dump XLSX file
    print 'Writing XLSX file...'
    from openpyxl import Workbook
    wb = Workbook()
    first_sheet = wb.get_active_sheet()
    _write_sheet(wb,'Summary', SM_HEADERS, SM_DATA)
    _write_sheet(wb,'Questions', Q_HEADERS, Q_DATA)
    _write_sheet(wb,'Scores', S_HEADERS, S_DATA)
    _write_sheet(wb,'Groupings', G_HEADERS, G_DATA)
    _write_sheet(wb,'Regions', R_HEADERS, R_DATA)
    _write_sheet(wb,'CountryCodes', CN_HEADERS, CN_DATA)
    wb.remove_sheet(first_sheet)
    wb.save( os.path.join(downloadfoldername,FILENAME_XLSX) )
    # Dump JSON file
    with open(os.path.join(downloadfoldername,FILENAME_JSON),'w') as jsonfile:
        json.dump(dataset,jsonfile)
    # Dump CSV files
    print 'Writing CSV file...'
    csv_q = FILENAME_CSV % 'questions'
    csv_g = FILENAME_CSV % 'groupings'
    csv_r = FILENAME_CSV % 'regions'
    csv_c = FILENAME_CSV % 'countrycodes'
    csv_s = FILENAME_CSV % 'scores'
    csv_sm = FILENAME_CSV % 'summary'
    _write_csv(csv_q, Q_HEADERS, Q_DATA)
    _write_csv(csv_g, G_HEADERS, G_DATA)
    _write_csv(csv_r, R_HEADERS, R_DATA)
    _write_csv(csv_c, CN_HEADERS, CN_DATA)
    _write_csv(csv_s, S_HEADERS, S_DATA)
    _write_csv(csv_sm, SM_HEADERS, SM_DATA)
    # Create zip file
    print 'Writing ZIP file...'
    with zipfile.ZipFile(os.path.join(downloadfoldername, FILENAME_CSV_ZIP),'w') as z:
        z.write(csv_q)
        z.write(csv_g)
        z.write(csv_r)
        z.write(csv_c)
        z.write(csv_s)
        z.write(csv_sm)
    os.unlink( csv_q )
    os.unlink( csv_g )
    os.unlink( csv_r )
    os.unlink( csv_c )
    os.unlink( csv_s )
    os.unlink( csv_sm )
    # Create list of downloads
    downloads = [ 
            {'filename':FILENAME_XLSX, 'format':'Excel' },
            {'filename':FILENAME_CSV_ZIP, 'format':'CSV' },
            {'filename':FILENAME_JSON, 'format':'JSON' },
            ]
    # Mapping of filenames
    for x in downloads:
        filename = os.path.join(downloadfoldername,x['filename'])
        raw_size = os.path.getsize(filename)
        x['size'] = _format_kilobytes(raw_size)
    # Write the JSONP file
    # --------------------
    dataset['downloads'] = downloads
    with open(jsonfilename,'w') as jsonfile:
        output_js = 'window._EXPLORER_DATASET = %s;' % json.dumps(dataset)
        print >>jsonfile, output_js
    print 'wrote %s' % jsonfilename



##################
# Helper Utilities
##################
def _format_kilobytes(x):
    x = str(x/1024)
    if len(x)>3:
        x = x[:-3]+','+x[-3:]
    return x+'kb'

def _write_sheet(wb,sheet_name,headers,data):
    # Dump CSV-style headers and data into an XLSX sheet
    sheet = wb.create_sheet()
    sheet.title = sheet_name
    y = 0
    for x in range(len(headers)):
        sheet.cell(row=y,column=x).value = headers[x]
    total = len(data)
    for row in data:
        y += 1
        for x in range(len(row)):
            sheet.cell(row=y,column=x).value = row[x]

def _write_csv(filename, headers, data):
    with open(filename,'w') as f:
        w = unicodecsv.writer(f)
        w.writerow(headers)
        for x in data:
            w.writerow(x)


###################
### Data Extractors
###################

def _regions_as_csv(dataset):
    # Create Regions sheet
    HEADERS = ['REGION_NAME','COUNTRY']
    DATA = []
    for region in dataset['regions']:
        for country in region['contains']:
            DATA.append( [region['name'],country] )
    return HEADERS, DATA

def _countrynames_as_csv(dataset,iso_data):
    countrypairs = sorted( { y:x for x,y in iso_data.items() }.items(), key=lambda x:x[0] )
    HEADERS = ['ISO3116','COUNTRY_NAME']
    DATA = [ list(x) for x in countrypairs ]
    return HEADERS, DATA

def _groupings_as_csv(dataset):
    HEADERS = ['CATEGORY','GROUP','QUESTION']
    DATA = []
    for category in dataset['groupings']:
        for entry in category['entries']:
            for question in entry['qs']:
                DATA.append( [category['by'],entry['title'],question] )
    return HEADERS, DATA

def _questions_as_csv(dataset):
    HEADERS = ['NUMBER','TEXT','A','B','C','D','E']
    DATA = []
    for x in sorted( dataset['question'].values(), key=lambda x:x['number']):
        DATA.append( [ x['number'],x['text'],x['a'],x['b'],x['c'],x['d'],x['e'] ]  )
    return HEADERS, DATA

def _scores_as_csv(dataset):
    q = range(1,125)
    HEADERS = ['COUNTRY','YEAR']
    for x in q: HEADERS.append(str(x))
    for x in q: HEADERS.append(str(x)+'l')
    DATA = []
    for country in dataset['country']:
        for year in [2006,2008,2010,2012]:
            db = country.get('db_%d'%year)
            if not db: continue
            row = [country['alpha2'],year]
            for x in q:
                row.append( db[str(x)] )
            for x in q:
                score = db[str(x)] 
                letter = {
                        0:'d',
                        -1: 'e',
                        33:'c',
                        67: 'b',
                        100:'a'
                        }[score]
                row.append(letter)
            DATA.append(row)
    return HEADERS, DATA


def _summary_as_csv(dataset):
    q = range(1,125)
    HEADERS = ['COUNTRY','YEAR','OPEN_BUDGET_INDEX','RANK']
    DATA = []
    for year in [2006,2008,2010,2012]:
        temp = []
        for country in dataset['country']:
            db = country.get('db_%d'%year)
            if not db: continue
            score = db['roundobi']
            row = [country['alpha2'],year,score,-1]
            temp.append(row)
        # Sort this year's array by score
        temp = sorted(temp, key=lambda x : x[2], reverse=True)
        # Add rankings
        rank = 0
        latest = -1
        for i in range(len(temp)):
            if temp[i][2]!=latest:
                latest = temp[i][2]
                rank = i+1
            temp[i][3] = rank
        # Fold this year's results into the overall results
        for x in temp:
            DATA.append(x)
    DATA = sorted(DATA, key=lambda x:x[0])
    return HEADERS, DATA
