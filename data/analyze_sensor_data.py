import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime

# Create output directory for plots
if not os.path.exists( 'plots' ) :
    os.makedirs( 'plots' )


def compute_mad( data ) :
    """Compute Median Absolute Deviation (MAD)"""
    median = np.median( data )
    absolute_deviations = np.abs( data - median )
    return np.median( absolute_deviations )


def generate_summary_tables( df ) :
    """Generate statistical summary tables for each measurement type"""
    summary_tables = { }
    continuous_types = ['temperature', 'humidity', 'current', 'voltage', 'heart_rate']
    discrete_types = ['moisture', 'light_value', 'motion_detected']

    for meas_type in df['measurement_type'].unique() :
        if meas_type == 'pump_state' :  # Skip pump_state as per request
            continue
        meas_data = df[df['measurement_type'] == meas_type]['value'].dropna()
        if meas_data.empty :
            continue

        # Calculate common statistics
        count = len( meas_data )
        min_val = meas_data.min()
        max_val = meas_data.max()

        if meas_type in continuous_types :
            # Continuous data: mean and standard deviation
            mean_val = meas_data.mean()
            std_val = meas_data.std()
            summary_tables[meas_type] = { 'N' : count, 'Minimum' : round( min_val, 2 ), 'Maximum' : round( max_val, 2 ), 'Mean' : round( mean_val, 2 ), 'Standard Deviation' : round( std_val, 2 ) }
        else :
            # Discrete data: median, MAD, and percentiles
            median_val = meas_data.median()
            mad_val = compute_mad( meas_data )
            p10 = np.percentile( meas_data, 10 )
            p90 = np.percentile( meas_data, 90 )
            summary_tables[meas_type] = { 'N' : count, 'Minimum' : round( min_val, 2 ), 'Maximum' : round( max_val, 2 ), 'Median' : round( median_val, 2 ), 'MAD' : round( mad_val, 2 ), '10th Percentile' : round( p10, 2 ),
                '90th Percentile' : round( p90, 2 ) }

    # Print summary tables
    for meas_type, stats in summary_tables.items() :
        print( f"\nTable: {meas_type.capitalize()} Summary" )
        print( "Indicator | Value" )
        print( "----------|------" )
        for key, value in stats.items() :
            print( f"{key} | {value}" )

    return summary_tables


def plot_data( df ) :
    """Generate visualizations for each measurement type"""
    for meas_type in df['measurement_type'].unique() :
        if meas_type == 'pump_state' :  # Skip pump_state
            continue
        meas_data = df[df['measurement_type'] == meas_type].copy()
        if meas_data.empty :
            continue

        # Convert timestamp to datetime
        meas_data['datetime'] = pd.to_datetime( meas_data['timestamp'], unit = 's' )

        # Time series plot
        plt.figure( figsize = (10, 6) )
        plt.plot( meas_data['datetime'], meas_data['value'], marker = 'o', linestyle = '-' )
        plt.title( f'{meas_type.capitalize()} Over Time' )
        plt.xlabel( 'Time' )
        plt.ylabel( meas_type.capitalize() )
        plt.grid( True )
        plt.xticks( rotation = 45 )
        plt.tight_layout()
        plt.savefig( f'plots/{meas_type}_timeseries.png' )
        plt.close()

        # Histogram
        plt.figure( figsize = (10, 6) )
        sns.histplot( meas_data['value'], bins = 30, kde = True )
        plt.title( f'{meas_type.capitalize()} Distribution' )
        plt.xlabel( meas_type.capitalize() )
        plt.ylabel( 'Frequency' )
        plt.grid( True )
        plt.tight_layout()
        plt.savefig( f'plots/{meas_type}_histogram.png' )
        plt.close()


def main() :
    # Load CSV file
    input_file = "sensor_data_filtered.csv"
    df = pd.read_csv( input_file )

    # Data cleaning: Remove rows with missing or invalid values
    df = df.dropna( subset = ['value'] )
    df = df[df['value'].apply( lambda x : isinstance( x, (int, float) ) )]

    # Generate summary tables
    generate_summary_tables( df )

    # Generate plots
    plot_data( df )


if __name__ == "__main__" :
    main()