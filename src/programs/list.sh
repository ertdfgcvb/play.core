#!/bin/bash

# Script to generate a list of all the projects,
# will be inserted in the manual page

# Trims a string
function trim {
	local var="$*"
	# remove leading whitespace characters
	var="${var#"${var%%[![:space:]]*}"}"
	# remove trailing whitespace characters
	var="${var%"${var##*[![:space:]]}"}"
	printf '%s' "$var"
}

SCRIPT_PATH=${0%/*}    # path to this script

URL_PREFIX='/#/src'

NUM_COLS=${1:-3}


# All folders
# FOLDERS=`find ./ -mindepth 1 -type d`

# Odered list of folders
FOLDERS=(basics sdf demos camera contributed)

for folder in ${FOLDERS[@]}; do

	FIRST=1

	for file in $SCRIPT_PATH/$folder/*.js; do
		# The path in $file is the full path:
		# ./play.core/src/programs/[folder]/[file].js
		URL=$URL_PREFIX$(echo $file | sed -e 's/\.\///' -e 's/\.js//' -e 's/\.play\.core\/src\/programs//')
		AUTHOR=$(sed -En 's/^@author[ \t](.*)$/\1/p' $file)
		TITLE=$(sed -En 's/^@title[ \t](.*)$/\1/p' $file)
		DESC=$(sed -En 's/^@desc[ \t](.*)$/\1/p' $file)

		if [[ $FIRST == 1 ]]; then
			FOLDER=$(echo $folder | sed -e 's/\.\///' -e 's/\///' -e 's/\.js//' )
			FIRST=0
			printf "\t"
			printf "<div class='program-cathegory'>"
			printf "$(trim $FOLDER)"
			printf "</div>"
			printf "\n"
		else
			if [[ $NUM_COLS == 3 ]]; then
				printf "\t"
				printf "<div>"
				printf "</div>"
				printf "\n"
			fi
		fi

		printf "\t"
		printf "<div>"
		if [[ $NUM_COLS == 3 ]]; then
			printf "<a target='_blank' href='$URL'>$(trim $TITLE)</a>"
		else
			printf "<a href='$URL'>$(trim $TITLE)</a>"
		fi
		printf "</div>"
		printf "\n"

		if [[ $NUM_COLS == 3 ]]; then
			printf "\t"
			printf "<div>"
			printf "$(trim $DESC)"
			printf "</div>"
			printf "\n"
		fi
	done
done
