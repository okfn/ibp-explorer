import xlrd
import json
import re

def verify_xls_format(*args):
    for v in args:
        if v[-4:]=='xlsx':
            raise ValueError('Error: XLSX is not supported. Files must be in XLS format: %s' % v)

def read_unified(iso_file, q_xls, g_xls, a_xls):
    # Output to populate
    out = {}
    # Question dict
    q_workbook = xlrd.open_workbook(q_xls)
    sheet = q_workbook.sheet_by_name('Sheet2')
    out['question'] = {}
    for n in range(1,sheet.nrows):
        out['question'][n] = { 
          'number': n,
          'text': sheet.cell(n,1).value,
          'a': sheet.cell(n,2).value,
          'b': sheet.cell(n,3).value,
          'c': sheet.cell(n,4).value,
          'd': sheet.cell(n,5).value,
          'e': sheet.cell(n,6).value,
          }
    # Load all country spreadsheets
    out['country'] = load_database_unified(a_xls, iso_file)

    # Question groupings
    g_workbook = xlrd.open_workbook(g_xls)
    sheet = g_workbook.sheet_by_name('QuestionsGroups')
    i = 1
    out['groupings'] = []
    # Scroll down column B
    while i < sheet.nrows:
        title = sheet.row(i)[1].value
        if title:
            group = {
                'by': title,
                'entries': [],
            }
            while i<sheet.nrows-1 and sheet.row(i+1)[1].value:
                i += 1
                group['entries'].append({
                  'title': sheet.row(i)[1].value,
                  'qs': parse_int_list( sheet.row(i)[2].value ),
                })
            out['groupings'].append( group )
        i += 1
    return out

def load_database_unified(a_xls, iso_file):
    # Custom regex
    question_label = re.compile('^q[0-9]+l?$')
    # Read country mapping
    iso_mapping = json.load(open(iso_file))
    workbook = xlrd.open_workbook(a_xls)
    sheet = workbook.sheet_by_name('Sheet1')
    out = {}
    for row_number in range(1, sheet.nrows):
        name = sheet.cell(row_number,0).value
        year = sheet.cell(row_number,1).value
        # Don't trust spreadsheets
        assert type(name) is unicode, '[Row %d] Invalid country name %s' % (row_number,unicode(name))
        name = name.strip()
        assert name in iso_mapping, '[Row %d] I have no ISO-3116 mapping for country name "%s". Please add one to %s.' % (row_number,name,iso_file)
        assert type(year) is float, '[Row %d] Invalid year %s' % (row_number,unicode(year))
        year = int(year)
        assert year in [2006,2008,2010,2012], '[Row %d] Unexpected value of "year": %s' % (row_number,year)
        alpha2 = iso_mapping[name]
        out[alpha2] = out.get(alpha2,{ 'name':name, 'alpha2':alpha2 })
        data = out[alpha2]['db_%d'%year] = {}
        # Construct output object
        for col_number in range(2,sheet.ncols):
            label = sheet.cell(0,col_number).value
            value = sheet.cell(row_number,col_number).value
            if question_label.match(label) is not None:
                error_string = '[Row %d] Invalid value for %s: %s'% (row_number,label,value)
                # Verify the value
                if label[-1]=='l':
                    assert value in ['','a','b','c','d','e'], error_string
                else:
                    if type(value) is str and len(value)==0:
                        # Blank becomes -1
                        value = -1.0
                    assert type(value) is float, error_string
                    value = int(round(value))
                    assert value in [100,67,33,0,-1], error_string
                label = label[1:]
            data[label] = value
    return sorted(out.values(),key=lambda x: x['name'])

def read(iso_file, q_xls, g_xls, a_2006, a_2008, a_2010, a_2012):
    # Read country mapping
    iso_mapping = json.load(open(iso_file))
    # Output to populate
    out = {}
    # Question dict
    q_workbook = xlrd.open_workbook(q_xls)
    sheet = q_workbook.sheet_by_name('Sheet2')
    out['question'] = {}
    for n in range(1,sheet.nrows):
        out['question'][n] = { 
          'number': n,
          'text': sheet.cell(n,1).value,
          'a': sheet.cell(n,2).value,
          'b': sheet.cell(n,3).value,
          'c': sheet.cell(n,4).value,
          'd': sheet.cell(n,5).value,
          'e': sheet.cell(n,6).value,
          }
    # Load all country spreadsheets
    db_2006 = load_database(a_2006, 'Individual Question Response')
    db_2008 = load_database(a_2008, 'Individual Question Response')
    db_2010 = load_database(a_2010, 'Individual Question Numbers')
    db_2012 = load_database(a_2012, 'Numbers (rotated)')
    # Merge into one dict
    merge = {}
    for (dbname,db) in [ 
            ('db_2006',db_2006), 
            ('db_2008',db_2008), 
            ('db_2010',db_2010),
            ('db_2012',db_2012)]:
        for x in db:
            country_name = x['name']
            if not country_name in iso_mapping:
                raise ValueError('I have no ISO-3116 mapping for country name "%s". Please add one to %s.' % (country_name, iso_file))
            alpha2 = iso_mapping[country_name]
            merge[alpha2] = merge.get(alpha2,{})
            merge[alpha2]['alpha2'] = alpha2
            merge[alpha2]['name'] = country_name
            merge[alpha2][dbname] = x['score']
    out['country'] = sorted(merge.values(),key=lambda x: x['name'])

    # Question groupings
    g_workbook = xlrd.open_workbook(g_xls)
    sheet = g_workbook.sheet_by_name('QuestionsGroups')
    i = 1
    out['groupings'] = []
    # Scroll down column B
    while i < sheet.nrows:
        title = sheet.row(i)[1].value
        if title:
            group = {
                'by': title,
                'entries': [],
            }
            while i<sheet.nrows-1 and sheet.row(i+1)[1].value:
                i += 1
                group['entries'].append({
                  'title': sheet.row(i)[1].value,
                  'qs': parse_int_list( sheet.row(i)[2].value ),
                })
            out['groupings'].append( group )
        i += 1
    return out

def load_database(filename, sheetname):
    workbook = xlrd.open_workbook(filename)
    sheet = workbook.sheet_by_name(sheetname)
    out = []
    header_row = 0
    while not (sheet.cell(header_row+1,0).value==1):
        header_row += 1
    for col in range(1, sheet.ncols):
        column = sheet.col_slice(col,header_row) 
        country_name = column[0].value
        c = {}
        out.append(c)
        c['name'] = country_name.strip()
        c['score'] = {}
        for i in range(1,len(column)):
            raw = column[i].value
            if raw is '' or raw is u'':
                c['score'][i] = -1
            elif type(raw) is float:
                c['score'][i] = int(round(raw))
            elif type(raw) in [str,unicode]:
                raw = str(raw)
                # Special case found in '08 document:
                if raw=='b': 
                    c['score'][i] = 67
                else: 
                    raise ValueError('what is this string? %s' % raw)
    return out


def parse_int_list(int_list):
    if int_list is '' or int_list is u'':
        return []
    if type(int_list) is str:
        int_list = unicode(int_list)
    if type(int_list) is float:
        int_list = unicode(int(int_list))
    
    out = []
    for s in int_list.replace(' ','').split(','):
        split = s.split('-')
        assert len(split)<3, 'Invalid range: %s' % s
        if len(split)==1:
            out.append(int(split[0]))
        else:
            for i in range(int(split[0]), int(split[1])+1):
                out.append(i)
    return out


def get_regions(groupings_xls):
    wb = xlrd.open_workbook(groupings_xls)
    sheet = wb.sheet_by_name('CountriesRegions')
    header_row = 2
    out = {}
    for col_number in range(sheet.ncols):
        col = sheet.col_slice(col_number,header_row)
        l = [ col[i].value for i in range(1, len(col)) ]
        # Strip empty strings and store the list
        out[ col[0].value ] = filter(bool,l)
    return out

