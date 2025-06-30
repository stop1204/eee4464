import json
import re
import pandas as pd

import numpy as np
import scipy
# https://grok.com/share/bGVnYWN5_aefe81ea-8e68-4757-8125-9dc09a78100f
# Sensor ID to sensor name mapping
SENSOR_MAPPING = {
    446400101: "Temperature Sensor",
    446400102: "Humidity Sensor",
    446400103: "Soil Moisture Sensor",
    446400104: "Soil Replay Sensor",
    446400105: "ACS712 Hall Effect Sensor",
    446400106: "Microwave Radar Sensor",
    446400107: "Photoresistor Sensor",
    446400108: "Heart Rate Sensor",
    446400116: "Test Sensor",
    446400118: "pump",
    446400119: "light",
    446400120: "humidity",
    446400121: "temperature",
    446400122: "current",
    446400123: "motion",
    446400124: "heart_rate"
}

def parse_sensor_data(file_path):
    # Read the SQL INSERT statements from the file
    with open(file_path, 'r') as file:
        lines = file.readlines()

    # Regex to parse INSERT statements
    pattern = r"INSERT INTO sensor_data VALUES\((\d+),(\d+),(\d+),'(\{.*?\})'\);"
    data_records = []

    for line in lines:
        match = re.match(pattern, line.strip())
        if match:
            data_id, sensor_id, timestamp, json_data = match.groups()
            sensor_id = int(sensor_id)
            timestamp = int(timestamp)
            # Parse JSON data
            try:
                json_dict = json.loads(json_data)
                # Create a record for each key-value pair in the JSON
                for key, value in json_dict.items():
                    data_records.append({
                        'data_id': int(data_id),
                        'sensor_id': sensor_id,
                        'sensor_name': SENSOR_MAPPING.get(sensor_id, "Unknown Sensor"),
                        'timestamp': timestamp,
                        'measurement_type': key,
                        'value': float(value)  # Convert value to float for numerical analysis
                    })
            except json.JSONDecodeError:
                print(f"Error parsing JSON in line: {line.strip()}")

    return data_records

def convert_to_csv(data_records, output_csv):
    # Convert to DataFrame
    df = pd.DataFrame(data_records)
    # Save to CSV
    df.to_csv(output_csv, index=False)
    return df

def generate_summary_tables(df):
    # Group by measurement type
    summary_tables = {}
    for meas_type in df['measurement_type'].unique():
        meas_data = df[df['measurement_type'] == meas_type]['value']
        if meas_data.empty:
            continue

        # Calculate statistics
        count = len(meas_data)
        min_val = meas_data.min()
        max_val = meas_data.max()

        if meas_type in ['temperature', 'humidity']:
            # Continuous data: mean and standard deviation
            mean_val = meas_data.mean()
            std_val = meas_data.std()
            summary_tables[meas_type] = {
                'N': count,
                'Minimum': min_val,
                'Maximum': max_val,
                'Mean': round(mean_val, 1),
                'Standard Deviation': round(std_val, 1)
            }
        else:
            # Discrete data (e.g., moisture ADC): median and IQR
            median_val = meas_data.median()
            iqr_val = scipy.stats.iqr(meas_data)
            summary_tables[meas_type] = {
                'N': count,
                'Minimum': min_val,
                'Maximum': max_val,
                'Median': round(median_val, 1),
                'IQR': round(iqr_val, 1)
            }

    # Print summary tables
    for meas_type, stats in summary_tables.items():
        print(f"\nTable: {meas_type.capitalize()} Summary")
        print("Indicator | Value")
        print("----------|------")
        for key, value in stats.items():
            print(f"{key} | {value}")

def main():
    # Input and output file paths
    input_file = "sensor_data.txt"
    output_csv = "sensor_data_filtered.csv"

    # Parse sensor data
    data_records = parse_sensor_data(input_file)

    # Convert to CSV
    df = convert_to_csv(data_records, output_csv)

    # Generate summary tables
    generate_summary_tables(df)

if __name__ == "__main__":
    main()