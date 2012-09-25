#!/usr/bin/env python

DEFAULT_QUESTIONFILE = 'OBS2012_QuestionsNumbers+Text.xls'
DEFAULT_ANSWERFILE = 'OBI_2010_Database.xls'
DEFAULT_GROUPINGSFILE = 'OBI_2012_groupings.xls'
DEFAULT_OUTPUT = '../vendor/ibp_dataset.js'

if __name__=='__main__':
    import process
    import argparse
    import json
    import sys
    parser = argparse.ArgumentParser(description='IBP data wrangling utility.')
    parser.add_argument('--questions', dest='qfile', default=DEFAULT_QUESTIONFILE, help="XLS file of 2010 questions")
    parser.add_argument('--answers', dest='afile', default=DEFAULT_ANSWERFILE, help="XLS file of 2010 survey answers")
    parser.add_argument('--groupings', dest='gfile', default=DEFAULT_GROUPINGSFILE, help="XLS file of question groupings")
    parser.add_argument('--output', dest='ofile', default=DEFAULT_OUTPUT, help="Output filename to write")
    arg = parser.parse_args()

    for v in vars(arg).values():
      if v[-4:]=='xlsx':
         parser.print_usage()
         print 'Error: XLSX is not supported. Files must be in XLS format.'
         sys.exit(-1)

    data = {
        'questions' : process.get_questions( arg.qfile ),
        'answers'   : process.get_answers(   arg.afile ),
        'groupings' : process.get_groupings(  arg.gfile ),
        'regions'   : process.get_regions(  arg.gfile ),
    }
    output_js = 'window._EXPLORER_DATASET = %s;' % json.dumps(data)
    f = open(arg.ofile,'w') 
    print >>f, output_js
    f.close()
    print 'wrote %s' % arg.ofile

