import xlrd
import os
import csv
import json

def get_questions(questions_xls):
    wb = xlrd.open_workbook(questions_xls)
    sheet = wb.sheet_by_name('Sheet2')
    out = [{ 'question':'ERROR: Do not try to access question 0!', 'a':'', 'b':'', 'c':'', 'd':'', 'e':''}]
    for n in range(1,sheet.nrows):
        out.append({ 
          'question': sheet.cell(n,1).value,
          'a': sheet.cell(n,2).value,
          'b': sheet.cell(n,3).value,
          'c': sheet.cell(n,4).value,
          'd': sheet.cell(n,5).value,
          'e': sheet.cell(n,6).value,
          })
    return out
    
def get_answers(answers_xls):
    wb = xlrd.open_workbook(answers_xls)
    sheet_n = wb.sheet_by_name('Individual Question Numbers')
    sheet_l = wb.sheet_by_name('Individual Question Letters')

    assert sheet_l.ncols==sheet_n.ncols, 'Numbers & Letters worksheets should be same width in columns'

    row_header = 5
    out = [ ]
    for col in range(1, sheet_n.ncols):
        column_n = sheet_n.col_slice(col,row_header) 
        column_l = sheet_l.col_slice(col,row_header) 
        assert column_n[0].value==column_l[0].value, 'Numbers & Lettes worksheets should have countries in the same order'
        row = { 'country' : column_n[0].value }
        for i in range(1,len(column_n)):
            number = column_n[i].value
            number = int(number) if number else -1
            letter = column_l[i].value
            row['n%d'%i] = number
            row['l%d'%i] = letter
        out.append(row)

    # All rows should be same length
    row_lengths = [len(row) for row in out] 
    assert len(set(row_lengths))==1, 'All rows should have same length: %s' % row_lengths
    
    return out

def parse_int_list(int_list):
    if not type(int_list) is unicode:
        int_list = unicode(int(int_list))
    
    out = []
    for s in int_list.replace(' ','').split(','):
        split = s.split('-')
        assert len(split)<3, 'Invalid range: %s' % s
        if len(split)==1:
            out.append(int(split[0]))
        else:
            for i in range(int(split[0]), int(split[1])):
                out.append(i)
    return out

def get_groupings(groupings_xls):
    wb = xlrd.open_workbook(groupings_xls)
    sheet = wb.sheet_by_name('QuestionsGroups')

    i = 1
    out = []
    # scroll down column B
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
            out.append( group )
        i += 1
    import json
    #print json.dumps(out, indent=2)
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

# =================
# Entry Point Logic 
# =================

if __name__=='__main__':
    import argparse
    import sys
    parser = argparse.ArgumentParser(description='IBP data wrangling utility.')
    parser.add_argument('questions_xls')
    parser.add_argument('answers_xls')
    parser.add_argument('groupings_xls')
    parser.add_argument('outputdir')
    arg = parser.parse_args()

    for v in vars(arg).values():
      if v[-4:]=='xlsx':
         parser.print_usage()
         print 'Error: XLSX is not supported. Files must be in XLS format.'
         sys.exit(-1)

    data = {
        'questions' : get_questions( arg.questions_xls ),
        'answers'   : get_answers(   arg.answers_xls ),
        'groupings' : get_groupings(  arg.groupings_xls ),
        'regions'   : get_regions(  arg.groupings_xls ),
    }
    filename = os.path.join(arg.outputdir, 'data.json')
    json.dump(data, open(filename,'w') )
    print 'wrote %s' % filename

