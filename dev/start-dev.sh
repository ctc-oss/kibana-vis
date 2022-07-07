#!/bin/bash
cd plugins/data-builder && yarn && yarn build && cd -
cd plugins/drilldown && yarn && yarn build && cd -
cd plugins/legend && yarn && yarn build && cd -

cd plugins/line-visualizer && yarn && cd -
cd plugins/radar-visualizer && yarn && cd -
cd plugins/bump-visualizer && yarn && cd -

yarn start --oss
