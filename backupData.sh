#!/bin/bash
TIME=`date +%b-%d-%y`            # This Command will add the date in the backup file's name.
FILENAME=backup-$TIME.tar.gz    # Backup file name format.
SRCDIR=/home/strangealmond/Hagrid/data/                         # Location of data to be backed up.
DESDIR=/home/strangealmond/Hagrid/data_backups/            # Destination of backup file.
tar -cpzf $DESDIR/$FILENAME $SRCDIR

