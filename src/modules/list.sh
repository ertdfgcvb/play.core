#!/bin/bash

# Script to generate a list of all the projects

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



function write {

	local var="$*"

	URL_PREFIX='/src/modules'

	FIRST=1

	for file in $SCRIPT_PATH/*.js; do

		CATEGORY=$(sed -En 's/^@category[ \t](.*)$/\1/p' $file)

		if [ $var == "$CATEGORY" ];
		then
			# The path in $file is the full path:
			# ./play.core/src/modules/[folder]/[file].js
			URL=$URL_PREFIX$(echo $file | sed -e 's/\.\///' -e 's/\.play\.core\/src\/modules//')
			MODULE=$(sed -En 's/^@module[ \t](.*)$/\1/p' $file)
			DESC=$(sed -En 's/^@desc[ \t](.*)$/\1/p' $file)

		if [[ $FIRST == 1 ]]; then
			FIRST=0
			printf "\t"
			printf "<div>"
			printf "$(trim $CATEGORY)"
			printf "</div>"
			printf "\n"
		else
			printf "\t"
			printf "<div>"
			printf "</div>"
			printf "\n"
		fi

			printf "\t"
			printf "<div>"
			printf "<a target='_blank' href='$URL'>$(trim $MODULE)</a>"
			printf "</div>"
			printf "\n"

			printf "\t"
			printf "<div>"
			printf "$(trim $DESC)"
			printf "</div>"
			printf "\n"
		fi

	done
}

echo $(write "public")
echo $(write "internal")
echo $(write "renderer")

