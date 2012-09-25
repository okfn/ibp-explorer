#!/usr/bin/env python

import process
from pprint import pprint

DEFAULT_QUESTIONFILE = 'OBS2012_QuestionsNumbers+Text.xls'
DEFAULT_ANSWERFILE = 'OBI_2010_Database.xls'
DEFAULT_GROUPINGSFILE = 'OBI_2012_groupings.xls'
DEFAULT_OUTPUT = 'table.csv'

def generate_fusion_table(qfile, afile, gfile, ofile):
    # Check file type
    process.verify_xls_format(qfile, afile, gfile)
    # Import it
    data = process.read( arg.qfile, arg.afile )
    # Dump it
    #f = open(arg.ofile,'w')
    #print >>f,'hey'
    #print 'wrote %s' % arg.ofile
    import csv
    import json
    google_data = json.load(open('fusion_table_country_names.json'))
    with open('tmp.csv','w') as csvfile:
        out = [ [google_data['mapping'][k],v['open_budget_index']] for k,v in data['country'].items() ]
        w = csv.writer(csvfile)
        w.writerow(['Country','Open Budget Index'])
        w.writerows(out)


if __name__=='__main__':
    import argparse
    parser = argparse.ArgumentParser(description='IBP data wrangling utility.')
    parser.add_argument('--questions', dest='qfile', default=DEFAULT_QUESTIONFILE, help="XLS file of 2010 questions")
    parser.add_argument('--answers', dest='afile', default=DEFAULT_ANSWERFILE, help="XLS file of 2010 survey answers")
    parser.add_argument('--groupings', dest='gfile', default=DEFAULT_GROUPINGSFILE, help="XLS file of question groupings")
    parser.add_argument('--output', dest='ofile', default=DEFAULT_OUTPUT, help="Output filename to write")
    arg = parser.parse_args()
    generate_fusion_table(arg.qfile,arg.afile,arg.gfile,arg.ofile)
