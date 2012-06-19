import xlrd
import sys
import os
import json
import csv
from pprint import pprint

def find_sheet(workbook, sheet_name):
    """Takes an Excel workbook and looks for a sheet.

    Returns an Excel sheet object, or throws an error."""
    for sheet in workbook.sheets():
        if sheet.name == sheet_name:
            return sheet
    raise NameError("No such sheet in workbook: %s" % sheet_name)

def parse(database,outfile):
    wb = xlrd.open_workbook(database)
    sheet = find_sheet(wb,'Individual Question Letters')
    #data = get_json(sheet)
    #json.dump( data, open(outfile,'w') )
    # Step 1: Parse the Excel spreadsheet to build one-per-row dicts
    data = get_csv(sheet)
    # Step 2: Dump as CSV
    writer = csv.writer( open(outfile,'w'), delimiter=',')
    for row in data:
        writer.writerow(row)

def get_json(sheet):
    """Use the XLRD library to interpret the spreadsheet.
    returns { CountryName -> [ score1, score2... ] }"""

    row_header = 5
    json_dict = {}
    for col in range(1, sheet.ncols):
        country_name = sheet.cell(row_header,col).value
        json_dict[country_name] = [ x.value for x in sheet.col_slice(col,row_header+1) ]
    return json_dict

def get_csv(sheet):
    """Use the XLRD library to interpret the spreadsheet.
    returns [ ['country','q1'..], ['Afghanistan','b',...] ...]"""

    row_header = 5

    data = []
    header = [ 'country' ] + [ 'q'+str(x) for x in range(sheet.nrows-row_header-1) ]
    data.append(header)
    for col in range(1, sheet.ncols):
        country_name = sheet.cell(row_header,col).value
        row = [ country_name ]
        for x in sheet.col_slice(col,row_header+1):
            row.append( x.value )
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
    parser = argparse.ArgumentParser(description='IBP data wrangling utility.')
    parser.add_argument('datafile')
    parser.add_argument('outputfile')
    arg = parser.parse_args()
    
    parse( arg.datafile, arg.outputfile )
