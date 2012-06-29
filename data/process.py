import xlrd
import os
import csv
import json

def get_questions(questions_xls):
    wb = xlrd.open_workbook(questions_xls)
    sheet = wb.sheet_by_name('Sheet2')
    out = []
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
    sheet = wb.sheet_by_name('Individual Question Letters')
    row_header = 5

    out = [ ]
    for col in range(1, sheet.ncols):
        s = sheet.col_slice(col,row_header) 
        row = { 'country' : s[0].value }
        for i in range(1,len(s)):
          row[i] = s[i].value

        out.append(row)

    # All rows should be same length
    row_lengths = [len(row) for row in out] 
    assert len(set(row_lengths))==1, 'All rows should have same length: %s' % row_lengths
    
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
    parser.add_argument('outputdir')
    arg = parser.parse_args()
    
    if arg.questions_xls[-4:]=='xlsx' or \
       arg.answers_xls[-4:]=='xlsx':
       parser.print_usage()
       print 'Error: XLSX is not supported. Files must be in XLS format.'
       sys.exit(-1)

    data = {
        'questions' : get_questions( arg.questions_xls ),
        'answers'   : get_answers(   arg.answers_xls ),
    }
    filename = os.path.join(arg.outputdir, 'data.json')
    json.dump(data, open(filename,'w') )
    print 'wrote %s' % filename

