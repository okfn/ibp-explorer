import xlrd
import json

def verify_xls_format(*args):
    for v in args:
        if v[-4:]=='xlsx':
            raise ValueError('Error: XLSX is not supported. Files must be in XLS format: %s' % v)

def read(iso_file, q_xls, a_xls, g_xls):
    # Read country mapping
    iso_mapping = json.load(open(iso_file))
    # Open Excel files...
    q_workbook = xlrd.open_workbook(q_xls)
    a_workbook = xlrd.open_workbook(a_xls)
    # Output to populate
    out = {}
    # Question dict
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
    # Country dict
    out['country'] = []
    sheet_n = a_workbook.sheet_by_name('Individual Question Numbers')
    sheet_l = a_workbook.sheet_by_name('Individual Question Letters')
    for col in range(1, sheet_n.ncols):
        column_n = sheet_n.col_slice(col,5) 
        column_l = sheet_l.col_slice(col,5) 
        assert column_n[0].value==column_l[0].value, 'Numbers & Letters worksheets should have countries in the same order'
        country_name = column_n[0].value
        c = {}
        out['country'].append(c)
        if not country_name in iso_mapping:
            raise ValueError('I have no ISO-3116 mapping for country name "%s". Please add one to %s.' % (country_name, iso_file))
        c['alpha2'] = iso_mapping[country_name]
        c['score'] = {}
        c['letter'] = {}
        for i in range(1,len(column_n)):
            number = column_n[i].value
            number = int(number) if number is not '' else -1
            letter = column_l[i].value
            c['score'][i] = number
            c['letter'][i] = letter
    # Which questions are used to calcule the Open Budget Index?
    sheet = a_workbook.sheet_by_name('Open Budget Index Numbers')
    out['questions_in_index'] = [ int(x.value) for x in sheet.col_slice(0,4) ]
    # Calculate the OBI score
    # Note the floating point arithmetic to ensure Python produces the same result as Excel 
    for data in out['country']:
        acc = 0
        count = 0
        for x in out['questions_in_index']:
            score = data['score'][x]
            if not score==-1:
                count += 1
                acc += score
        data['open_budget_index'] = int(round(float(acc)/count))
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



def parse_int_list(int_list):
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

