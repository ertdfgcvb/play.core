#!/bin/zsh

# Script to replace the [header] string of each .js script
# with the contents of the file 'header.txt'.
# Expects a valid path for the output of the files.

if [ -z $1 ]; then
	echo "Please specify an output folder."
	exit 1
fi

# A bit of a cumbersome workaround
# as the script won't be called from the current folder:
CURRENT_PATH=$(pwd)    # path from where this script has been called
TARGET_PATH=$(pwd)/$1  # path to the copied .js files
SCRIPT_PATH=${0%/*}    # path to this script

if [[ $SCRIPT_PATH -ef $TARGET_PATH ]];  then
	echo "Can’t overwrite the current files."
	exit 1
fi


mkdir -p $TARGET_PATH

cd $SCRIPT_PATH

EXPR_1="/\[header\]/r header.txt" # Insert the contents of _header.txt after [header]
EXPR_2="/\[header\]/d"             # Delete the line with [header]

for f in ./*.js; do
	P=$(echo $TARGET_PATH/$f | sed 's/\/.\//\//g') # prettier output
	echo "Writing $P..."
	sed -e "$EXPR_1"  -e "$EXPR_2" "$f" > "$TARGET_PATH/$f"
done

cd $CURRENT_PATH
