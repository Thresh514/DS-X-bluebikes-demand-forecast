#!/usr/bin/env python3
"""
Download Bluebikes dataset from Hugging Face and organize by year and type.
"""

from huggingface_hub import hf_hub_download
import os
import shutil
from pathlib import Path

def main():
    repo_id = 'bigmatthew/506_final_project_data'

    # Create directory structure
    # All data goes under data/
    # 2024 data: data/2024_data/
    # 2023 data organized by type:
    #   - data/2023_data/Bluebikes/
    #   - data/2023_data/Weather/
    #   - data/2023_data/Features/

    dir_2024 = Path('data/2024_data')
    dir_2023_bluebikes = Path('data/2023_data/Bluebikes')
    dir_2023_weather = Path('data/2023_data/Weather')
    dir_2023_features = Path('data/2023_data/Features')

    dir_2024.mkdir(parents=True, exist_ok=True)
    dir_2023_bluebikes.mkdir(parents=True, exist_ok=True)
    dir_2023_weather.mkdir(parents=True, exist_ok=True)
    dir_2023_features.mkdir(parents=True, exist_ok=True)

    # File lists
    files_2024_bluebikes = [
        '202401-bluebikes-tripdata.csv',
        '202402-bluebikes-tripdata.csv',
        '202403-bluebikes-tripdata.csv',
        '202404-bluebikes-tripdata.csv',
        '202405-bluebikes-tripdata.csv',
        '202406-bluebikes-tripdata.csv',
        '202407-bluebikes-tripdata.csv',
        '202408-bluebikes-tripdata.csv',
        '202409-bluebikes-tripdata.csv',
        '202410-bluebikes-tripdata.csv',
        '202411-bluebikes-tripdata.csv',
        '202412-bluebikes-tripdata.csv'
    ]

    files_2023_bluebikes = [
        '202301-bluebikes-tripdata.csv',
        '202302-bluebikes-tripdata.csv',
        '202303-bluebikes-tripdata.csv',
        '202304-bluebikes-tripdata.csv',
        '202305-bluebikes-tripdata.csv',
        '202306-bluebikes-tripdata.csv',
        '202307-bluebikes-tripdata.csv',
        '202308-bluebikes-tripdata.csv',
        '202309-bluebikes-tripdata.csv',
        '202310-bluebikes-tripdata.csv',
        '202311-bluebikes-tripdata.csv',
        '202312-bluebikes-tripdata.csv'
    ]

    files_weather = [
        '202304-weather.csv',
        '202305-weather.csv',
        '202306-weather.csv',
        '202307-weather.csv',
        '202308-weather.csv',
        '202309-weather.csv',
        '202310-weather.csv',
        '202311-weather.csv',
        '202312-weather.csv'
    ]

    files_features = [
        'Bus_Stops.csv',
        'Commuter_Rail_Stops.csv',
        'Rapid_Transit_Stops.csv',
        'Universities.csv',
        'feature.csv'
    ]

    # Download 2024 Bluebikes data
    print('='*60)
    print('Downloading 2024 Bluebikes trip data...')
    print('='*60)
    for filename in files_2024_bluebikes:
        print(f'  Downloading {filename}...')
        try:
            path = hf_hub_download(repo_id=repo_id, filename=filename, repo_type='dataset')
            dest = dir_2024 / filename
            shutil.copy(path, dest)
            print(f'    ✓ Saved to {dest}')
        except Exception as e:
            print(f'    ✗ Error: {e}')

    # Download 2023 Bluebikes data
    print('\n' + '='*60)
    print('Downloading 2023 Bluebikes trip data...')
    print('='*60)
    for filename in files_2023_bluebikes:
        print(f'  Downloading {filename}...')
        try:
            path = hf_hub_download(repo_id=repo_id, filename=filename, repo_type='dataset')
            dest = dir_2023_bluebikes / filename
            shutil.copy(path, dest)
            print(f'    ✓ Saved to {dest}')
        except Exception as e:
            print(f'    ✗ Error: {e}')

    # Download weather data
    print('\n' + '='*60)
    print('Downloading weather data...')
    print('='*60)
    for filename in files_weather:
        print(f'  Downloading {filename}...')
        try:
            path = hf_hub_download(repo_id=repo_id, filename=filename, repo_type='dataset')
            dest = dir_2023_weather / filename
            shutil.copy(path, dest)
            print(f'    ✓ Saved to {dest}')
        except Exception as e:
            print(f'    ✗ Error: {e}')

    # Download feature/station data
    print('\n' + '='*60)
    print('Downloading feature and station data...')
    print('='*60)
    for filename in files_features:
        print(f'  Downloading {filename}...')
        try:
            path = hf_hub_download(repo_id=repo_id, filename=filename, repo_type='dataset')
            dest = dir_2023_features / filename
            shutil.copy(path, dest)
            print(f'    ✓ Saved to {dest}')
        except Exception as e:
            print(f'    ✗ Error: {e}')

    # Summary
    print('\n' + '='*60)
    print('Download complete!')
    print('='*60)
    print(f'📁 Data structure:')
    print(f'   data/')
    print(f'   ├── 2024_data/           ({len(files_2024_bluebikes)} Bluebikes files)')
    print(f'   └── 2023_data/')
    print(f'       ├── Bluebikes/       ({len(files_2023_bluebikes)} trip data files)')
    print(f'       ├── Weather/         ({len(files_weather)} weather files)')
    print(f'       └── Features/        ({len(files_features)} station/feature files)')
    print('='*60)

if __name__ == '__main__':
    main()
