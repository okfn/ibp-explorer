#!/usr/bin/env python

import json

import lib_read
import lib_write

DEFAULT_ISOFILE = 'country_to_iso3166.json'
DEFAULT_OUTPUT = '../vendor/ibp_dataset.js'
DEFAULT_DOWNLOADFOLDER = '../explorer/assets/downloads/'

DOWNLOADS_COMPARABLE = {}
DOWNLOADS_COMPARABLE['xlsx'] = 'ibp_data_comparable.xlsx'
DOWNLOADS_COMPARABLE['csv'] = 'ibp_data_%s_comparable.csv'
DOWNLOADS_COMPARABLE['csv_zip'] = 'ibp_data_csv_comparable.zip'
DOWNLOADS_COMPARABLE['json'] = 'ibp_data_comparable.json'

DOWNLOADS_2015 = {}
DOWNLOADS_2015['xlsx'] = 'ibp_data_2015.xlsx'
DOWNLOADS_2015['csv'] = 'ibp_data_%s_2015.csv'
DOWNLOADS_2015['csv_zip'] = 'ibp_data_csv_2015.zip'
DOWNLOADS_2015['json'] = 'ibp_data_2015.json'

DOWNLOADS_2017 = {}
DOWNLOADS_2017['xlsx'] = 'ibp_data_2017.xlsx'
DOWNLOADS_2017['csv'] = 'ibp_data_%s_2017.csv'
DOWNLOADS_2017['csv_zip'] = 'ibp_data_csv_2017.zip'
DOWNLOADS_2017['json'] = 'ibp_data_2017.json'

DOWNLOADS_PRE_2015 = {}
DOWNLOADS_PRE_2015['xlsx'] = 'ibp_data_2006-2012.xlsx'
DOWNLOADS_PRE_2015['csv'] = 'ibp_data_%s_2006-2012.csv'
DOWNLOADS_PRE_2015['csv_zip'] = 'ibp_data_csv_2006-2012.zip'
DOWNLOADS_PRE_2015['json'] = 'ibp_data_2006-2012.json'


def run_etl(js_output_path, download_dir_path, skip_downloads=False):
    # Get ISO data
    iso_data = json.load(open(DEFAULT_ISOFILE))

    # Comparable survey data
    datafiles = {}
    datafiles['q_xlsx'] = 'OBS2015_QuestionsNumbers+Text.xlsx'
    datafiles['q_xlsx_sheet'] = 'Sheet1'
    datafiles['a_xlsx'] = 'Comparable_OBS_Timeseries.xlsx'
    datafiles['a_xlsx_sheet'] = 'COBI 2006-2015 data'
    datafiles['g_xlsx'] = 'GroupingsOBSQuestions2015.xlsx'
    datafiles['g_xlsx_qsheet'] = 'QuestionsGroups'
    datafiles['g_xlsx_csheet'] = 'CountriesRegions'
    datafiles['av_xlsx'] = 'Public Availability 2015.xlsx'
    datafiles['av_xlsx_sheets'] = ['2006', '2008', '2010', '2012', '2015']
    datafiles['years'] = [2006, 2008, 2010, 2012, 2015]

    comparable_dataset = lib_read.read(iso_data, datafiles, "old")
    if not skip_downloads:
        comparable_dataset = lib_write.write_downloads(comparable_dataset,
                                                       iso_data,
                                                       download_dir_path,
                                                       DOWNLOADS_COMPARABLE,
                                                       datafiles['years'])

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
    datafiles['av_xlsx_sheets'] = ['2006', '2008', '2010', '2012']
    datafiles['years'] = [2006, 2008, 2010, 2012]

    old_dataset = lib_read.read(iso_data, datafiles, "old")
    if not skip_downloads:
        old_dataset = lib_write.write_downloads(old_dataset, iso_data,
                                                download_dir_path,
                                                DOWNLOADS_PRE_2015,
                                                datafiles['years'])

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
    datafiles['av_xlsx_sheets'] = ['2006', '2008', '2010', '2012', '2015']
    datafiles['pp_xlsx'] = 'public participation.xlsx'
    datafiles['pp_xlsx_sheet'] = 'Sheet1'
    datafiles['years'] = [2015]

    dataset_2015 = lib_read.read(iso_data, datafiles, '2015')
    if not skip_downloads:
        dataset_2015 = lib_write.write_downloads(dataset_2015, iso_data,
                                                 download_dir_path,
                                                 DOWNLOADS_2015,
                                                 datafiles['years'])

    # 2017 survey data
    datafiles = {}
    datafiles['q_xlsx'] = 'OBS2017_QuestionsNumbers+Text.xlsx'
    datafiles['q_xlsx_sheet'] = '2017'
    datafiles['a_xlsx'] = 'OBI 2017.xlsx'
    datafiles['a_xlsx_sheet'] = 'Sheet1'
    # ::TODO:: groupings to use new 2017 file?
    datafiles['g_xlsx'] = 'GroupingsOBSQuestions2015.xlsx'
    datafiles['g_xlsx_qsheet'] = 'QuestionsGroups'
    datafiles['g_xlsx_csheet'] = 'CountriesRegions'

    datafiles['av_xlsx'] = 'Public Availability 2017.xlsx'
    datafiles['av_xlsx_sheets'] = \
        ['2006', '2008', '2010', '2012', '2015', '2017']
    datafiles['pp_xlsx'] = 'public participation.xlsx'
    datafiles['pp_xlsx_sheet'] = 'Sheet1'
    datafiles['years'] = [2017]

    dataset_2017 = lib_read.read(iso_data, datafiles, '2017')
    if not skip_downloads:
        dataset_2017 = lib_write.write_downloads(dataset_2017, iso_data,
                                                 download_dir_path,
                                                 DOWNLOADS_2017,
                                                 datafiles['years'])
    dataset = {}
    dataset.update(old_dataset)
    dataset.update(dataset_2015)
    dataset.update(dataset_2017)

    # Write output js file
    lib_write.write_js(dataset, js_output_path)


if __name__ == '__main__':
    run_etl(DEFAULT_OUTPUT, DEFAULT_DOWNLOADFOLDER)
