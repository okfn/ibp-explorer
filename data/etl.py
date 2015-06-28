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

DOWNLOADS_2015 = {}
DOWNLOADS_2015['xlsx'] = 'ibp_data_2015.xlsx'
DOWNLOADS_2015['csv'] = 'ibp_data_%s_2015.csv'
DOWNLOADS_2015['csv_zip'] = 'ibp_data_csv_2015.zip'
DOWNLOADS_2015['json'] = 'ibp_data_2015.json'

DOWNLOADS_PRE_2015 = {}
DOWNLOADS_PRE_2015['xlsx'] = 'ibp_data_2006-2012.xlsx'
DOWNLOADS_PRE_2015['csv'] = 'ibp_data_%s_2006-2012.csv'
DOWNLOADS_PRE_2015['csv_zip'] = 'ibp_data_csv_2006-2012.zip'
DOWNLOADS_PRE_2015['json'] = 'ibp_data_2006-2012.json'

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
    old_dataset = lib_write.write_downloads(old_dataset, iso_data, DEFAULT_DOWNLOADFOLDER, DOWNLOADS_PRE_2015, datafiles['years'])

    # 2015 survey data
    datafiles = {}
    datafiles['q_xlsx'] = 'OBS2015_QuestionsNumbers+Text.xlsx'
    datafiles['q_xlsx_sheet'] = 'Sheet1'
    datafiles['a_xlsx'] = 'OBI 2015.xlsx'
    datafiles['a_xlsx_sheet'] = 'Sheet1'
    datafiles['g_xlsx'] = 'GroupingsOBSQuestions2015.xlsx'
    datafiles['g_xlsx_qsheet'] = 'QuestionsGroups'
    datafiles['g_xlsx_csheet'] = 'CountriesRegions'
    datafiles['av_xlsx'] = 'Public Availability 2015.xlsx'
    datafiles['av_xlsx_sheets'] = ['2006','2008','2010','2012','2015']
    datafiles['pp_xlsx'] = 'public participation.xlsx'
    datafiles['pp_xlsx_sheet'] = 'Sheet1'
    datafiles['years'] = [2015]

    dataset = lib_read.read( iso_data, datafiles, False )
    dataset = lib_write.write_downloads(dataset, iso_data, DEFAULT_DOWNLOADFOLDER, DOWNLOADS_2015, datafiles['years'])
    dataset.update(old_dataset)

    # Write output js file
    lib_write.write_js(dataset, DEFAULT_OUTPUT)
