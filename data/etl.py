#!/usr/bin/env python

# Standard libraries
import argparse
import json
import sys
# Custom pipeline
import lib_read
import lib_write
from settings import *

if __name__=='__main__':
    parser = argparse.ArgumentParser(description='IBP Extract-Transform-Load pipeline.')
    parser.add_argument('--iso', dest='isofile', default=DEFAULT_ISOFILE, help="JSON file of country_name to iso-3166 alpha 2 codes")
    parser.add_argument('--questions', dest='qfile', default=DEFAULT_QUESTIONFILE, help="XLS file of 2012 questions")
    parser.add_argument('--groupings', dest='gfile', default=DEFAULT_GROUPINGSFILE, help="XLS file of question groupings")
    parser.add_argument('--availability', dest='avfile', default=DEFAULT_AVAILABILITYFILE, help="XLS file of 'Public Availability' dataset.")
    parser.add_argument('--answers', dest='afile', default=DEFAULT_ANSWERFILE, help="XLS file of all survey answers")
    parser.add_argument('--output', dest='ofile', default=DEFAULT_OUTPUT, help="Output filename to write")
    parser.add_argument('--downloads', dest='dfolder', default=DEFAULT_DOWNLOADFOLDER, help="Folder to store downloadable DB")

    arg = parser.parse_args()
    for v in vars(arg).values():
      if v[-4:]=='xls':
         parser.print_usage()
         print 'Error: XLS is not supported. Files must be in XLSX format. (Filename: %s)' % v
         sys.exit(-1)

    # Get ISO data
    iso_data = json.load(open(arg.isofile))
    dataset = lib_read.read( iso_data, arg.qfile, arg.gfile, arg.afile, arg.avfile )
    lib_write.write(dataset, iso_data, arg.ofile, arg.dfolder)

