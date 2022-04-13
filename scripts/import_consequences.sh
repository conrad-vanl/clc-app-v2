#! /usr/bin/env bash

DIR="$( cd "$( dirname "$0" )" && pwd )"

COLOR_NC='\033[0m' # No Color
COLOR_LGREEN='\033[1;32m'
COLOR_GRAY='\033[1;30m'
COLOR_LGRAY='\033[0;37m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'

## *** Utility functions ***

logv() {
  [[ -z "$VERBOSE" ]] && return 0;

  local msg=$@
  [[ -z $CONTENTFUL_MANAGEMENT_TOKEN ]] || msg=$(echo "$@" | sed "s/$CONTENTFUL_MANAGEMENT_TOKEN/\*\*\*\*\*/" )
  [[ -z $CONTENTFUL_ACCESS_TOKEN ]] || msg=$(echo "$msg" | sed "s/$CONTENTFUL_ACCESS_TOKEN/\*\*\*\*\*/" )
  >&2 echo -e "${COLOR_GRAY}$msg${COLOR_NC}" || true
}

logerr() {
  >&2 echo -e "${COLOR_RED}$@${COLOR_NC}"
}

panic() {
  logerr "$@"
  exit -1;
}

curlv() {
  execv curl "$@"
}

execv() {
  logv "$@"
  "$@"
}

confirm() {
  while true; do
    if [[ -z "$2" ]]; then
      read -p $'\033[1;36m'"$1"' (exec/skip): '$'\033[0m' yn
    else
      # double confirm - extra dangerous.
      read -p $'\033[0;31m'"$1"' (exec/skip): '$'\033[0m' yn
    fi
    echo "$yn"
    case $yn in
        [Ee]* ) return 0;;
        [Ss]* ) return 1;;
        * ) echo "Please answer 'execute' or 'skip'.";;
    esac
  done
}

# Write your usage
usage() {
  echo "$0
  Converts a CSV file to a set of consequences and uploads them to Contentful
  " && \
  grep " .)\ #" $0; exit 0;
}

VERBOSE=true
# Parse additional args here
while getopts ":hvVs:a:t:e:" arg; do
  case $arg in
    V) # Non-verbose mode - less output
      VERBOSE=
      ;;
    s) # Contentful Space ID - overrides env var CONTENTFUL_SPACE_ID
      export CONTENTFUL_SPACE_ID=$OPTARG
      ;;
    a) # Contentful Mgmt Token - overrides env var CONTENTFUL_MANAGEMENT_TOKEN
      export CONTENTFUL_MANAGEMENT_TOKEN=$OPTARG
      ;;
    t) # Contentful access Token - overrides env var CONTENTFUL_ACCESS_TOKEN
      export CONTENTFUL_ACCESS_TOKEN=$OPTARG
      ;;
    e) # Contentful environment ID - overrides env var CONTENTFUL_ENVIRONMENT
      export CONTENTFUL_ENVIRONMENT=$OPTARG
      ;;
    h | *) # Display help.
      usage
      exit 0
      ;;
  esac
done

shift $(($OPTIND - 1))

command -v jq >/dev/null 2>&1 || (panic "I require 'jq' but it's not installed.  Please 'brew install jq'.")
command -v mlr >/dev/null 2>&1 || (panic "I require 'Miller' but it's not installed.  Please 'brew install miller'.")

PATH="$(yarn global bin):$PATH"
command -v contentful >/dev/null 2>&1 || (panic "I require 'contentful' but it's not installed.  Please 'yarn global add contentful-cli'.")

tmpfile=$(mktemp)
touch "$tmpfile"
function cleanup() {
  rm "$tmpfile"
}
trap cleanup EXIT;

function import() {
  file=${1:-"consequences.csv"}
  logv "loading from ${file}"

  script="cat then clean-whitespace then skip-trivial-records"
  mlr --icsv --ojson $script "$file" | jq -r -c '.[]' | parse_import_line | jq --slurp '{ entries: . }' > "$tmpfile"
  count=$(jq '.entries | length' "$tmpfile")
  environment_id=${CONTENTFUL_ENVIRONMENT:-"master"}
  if confirm "import ${count} consequences into the ${environment_id} environment?"; then
    execv contentful space import \
      --content-file "$tmpfile" \
      --space-id "$CONTENTFUL_SPACE_ID" \
      --environment-id "$environment_id" \
      --management-token "$CONTENTFUL_MANAGEMENT_TOKEN"
  fi
}

function parse_import_line {
  ruby -e "$(cat <<- 'EOF'
require 'json'
require 'digest'

begin
ARGF.each_line do |line|
  structured = JSON.parse(line)
  name = structured["Consequence Name"]
  description = structured["Description"]

  fields = {
    internalTitle: { 'en-US': name },
    title: { 'en-US': name },
    description: { 'en-US': description }
  }

  entry = {
    sys: { 
      id: Digest::SHA1.hexdigest(name),
      contentType: {
        sys: { id: 'consequence' }
      }
    },
    fields: fields
  }

  puts entry.to_json
end
rescue => ex
  # piped to HEAD which ended the stream
  return if ex.is_a? Errno::EPIPE
  abort($@)
end
EOF
)"
}

import "$@"
