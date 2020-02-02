#!/bin/bash
#Purpose = Backup hagrid's data
DATE=`date +%d`            # Creates a variable for the current date
CUR_YEAR=`date +%Y`
CUR_MONTH=`date +%m`
FILENAME=backup-$DATE.tar.gz    # Backup file name format
SRCDIR=/home/strangealmond/Discord-Bots/Hagrid/src/data/                         # Location of data to be backuped up
DESDIR=/home/strangealmond/Discord-Bots/Hagrid/data_backups/$CUR_YEAR/$CUR_MONTH            # Destination of backup file.

if [ ! -d "$DESDIR" ]; then # Check if the DESDIR exists
        mkdir -p $DESDIR
        
fi

tar -cpzf $DESDIR/$FILENAME $SRCDIR             # Backup the data