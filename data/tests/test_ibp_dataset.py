import os
import json
from etl import run_etl


class TestETLOutput:

    '''
    Basic tests for ibp dataset etl system.

    Expected dataset is in tests/ibp_dataset.json. etl pipeline is run and
    compared with expected dataset.
    '''

    @classmethod
    def setup_class(cls):
        skip_downloads = True  # If True, don't write download files (faster)
        dir_path = os.path.dirname(os.path.realpath(__file__))
        js_output_path = os.path.join(dir_path, 'data/etl_output_dataset.js')
        json_output_path = \
            os.path.join(dir_path, 'data/etl_output_dataset.json')
        downloads_path = os.path.join(dir_path, 'data/downloads/')
        # Create directory for writing test files
        if not os.path.exists(downloads_path):
            os.mkdir(downloads_path)

        # import expected data from ibp_dataset
        with open(os.path.join(dir_path,
                               'ibp_dataset.json')) as expected_data:
            cls.expected_data = json.load(expected_data)
            if skip_downloads:
                del cls.expected_data['downloads']
                del cls.expected_data['downloads_old']

        # get data to test from etl pipeline
        run_etl(js_output_path, downloads_path, skip_downloads)
        with open(js_output_path) as etl_data:
            etl_data = etl_data.read()
            etl_data = etl_data.lstrip('window._EXPLORER_DATASET = ')
            etl_data = etl_data.rstrip(';\n')
            cls.etl_data = json.loads(etl_data)

        # quite useful to have a copy of the json output
        with open(json_output_path, 'w') as etl_json_data:
            json.dump(cls.etl_data, etl_json_data)

    def test_keys(self):
        '''etl_data has expected keys'''
        assert \
            (sorted(self.etl_data.keys()) == sorted(self.expected_data.keys()))

    def test_items_not_empty(self):
        '''each dict item isn't empty '''
        for i in self.etl_data:
            assert len(i) > 0

    def test_item_data(self):
        '''each dict item matches expected'''
        for k, v in self.etl_data.items():
            assert self.expected_data[k] == v
