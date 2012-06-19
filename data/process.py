import xlrd
import os
import csv
import json

def process_questions(questions_xls,outputdir):
    wb = xlrd.open_workbook(questions_xls)
    sheet = wb.sheet_by_name('Sheet2')
    # Step 1: Parse the Excel spreadsheets
    questions = get_question_data(sheet)
    # Step 2: Dump as CSV
    filename = os.path.join(outputdir, 'questions.json')
    json.dump(questions,open(filename,'w'))
    print 'wrote %s' % filename
    
def process_answers(answers_xls,outputdir):
    wb = xlrd.open_workbook(answers_xls)
    sheet = wb.sheet_by_name('Individual Question Letters')
    # Step 1: Parse the Excel spreadsheet
    answers = get_answers_data(sheet)
    # Step 2: Dump as CSV
    filename = os.path.join(outputdir, 'answers.csv')
    writer = csv.writer( open(filename,'w'), delimiter=',')
    for row in answers:
        writer.writerow(row)
    print 'wrote %s' % filename

def get_question_data(sheet):
    """Use the XLRD library to interpret the spreadsheet.
    returns CSV format."""
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

def get_answers_data(sheet):
    """Use the XLRD library to interpret the spreadsheet.
    returns [ ['country','q1'..], ['Afghanistan','b',...] ...]"""

    row_header = 5

    header = [ 'country' ] + [ 'q'+str(x) for x in range(sheet.nrows-row_header-1) ]
    data = [ header ]
    for col in range(1, sheet.ncols):
        row = [ x.value for x in sheet.col_slice(col,row_header) ]
        data.append(row)
    # All rows should be same length
    row_lengths = [len(row) for row in data] 
    assert len(set(row_lengths))==1, 'All rows should have same length: %s' % row_lengths

    return data

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

    process_questions( arg.questions_xls, arg.outputdir )
    process_answers( arg.answers_xls, arg.outputdir )
