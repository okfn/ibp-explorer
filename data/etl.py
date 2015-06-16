#!/usr/bin/env python

# Standard libraries
import argparse
import json
import sys
# Custom pipeline
import lib_read
import lib_write

DEFAULT_ISOFILE = 'country_to_iso3166.json'
DEFAULT_OUTPUT = '../vendor/ibp_dataset.js'
DEFAULT_DOWNLOADFOLDER = '../app/assets/downloads/'

if __name__=='__main__':
    # Get ISO data
    iso_data = json.load(open(DEFAULT_ISOFILE))
    
    # Pre-2015 survey data
    datafiles = {}
    datafiles['q_xlsx'] = 'OBS2012_QuestionsNumbers+Text.xlsx'
    datafiles['q_xlsx_sheet'] = 'Sheet2'
    datafiles['a_xlsx'] = 'OBI_UNIFIED.xlsx'
    datafiles['a_xlsx_sheet'] = 'Sheet1'
    datafiles['g_xlsx'] = 'GroupingsOBSQuestions2012_102112.xlsx'
    datafiles['g_xlsx_qsheet'] = 'QuestionsGroups'
    datafiles['g_xlsx_csheet'] = 'CountriesRegions'
    datafiles['av_xlsx'] = 'Public Availability All Years.xlsx'
    datafiles['av_xlsx_sheets'] = ['2006','2008','2010','2012']
    datafiles['years'] = [2006,2008,2010,2012]

    old_dataset = lib_read.read( iso_data, datafiles, True )

    # 2015 survey data
    datafiles = {}
    datafiles['q_xlsx'] = 'OBS2015_QuestionsNumbers+Text.xlsx'
    datafiles['q_xlsx_sheet'] = 'Sheet1'
    datafiles['a_xlsx'] = 'OBI 2006-2015 Timeseries.xlsx'
    datafiles['a_xlsx_sheet'] = 'Sheet1'
    datafiles['g_xlsx'] = 'GroupingsOBSQuestions2015.xlsx'
    datafiles['g_xlsx_qsheet'] = 'QuestionsGroups'
    datafiles['g_xlsx_csheet'] = 'CountriesRegions'
    datafiles['av_xlsx'] = 'Public Availability 2015.xlsx'
    datafiles['av_xlsx_sheets'] = ['2006','2008','2010','2012','2015']
    datafiles['years'] = [2006,2008,2010,2012,2015]

    dataset = lib_read.read( iso_data, datafiles, False )
    dataset.update(old_dataset)

    # Write output js file and files to download
    lib_write.write(dataset, iso_data, DEFAULT_OUTPUT, DEFAULT_DOWNLOADFOLDER)
