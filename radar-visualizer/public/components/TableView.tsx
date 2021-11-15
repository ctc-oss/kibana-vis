import React from 'react';
import flatten from 'flat';
import { pickBy } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';

import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiDataGrid,
  EuiLoadingSpinner,
  EuiSpacer,
} from '@elastic/eui';

import { SecondaryTableView } from './SecondaryTable';
import { formattedNumber } from '../defines/radar';
interface LayerIconProps {
  width?: number;
}

export const LayerIcon = styled(EuiBadge)<LayerIconProps>`
  margin-top: -1px;
  padding: 0 4px;
  text-align: center;
  font-weight: 700;
  ${(props) => (props.width ? `width: ` + props.width + 'px !important' : '')}
`;

interface PlainListProps {
  height: number;
}

const PlainList = styled.div<PlainListProps>`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  height: ${(props) => props.height}px;
  padding-bottom: 3px;
`;

const PlainListItem = styled.div`
  display: flex;
  flex-direction: row;
  flex-basis: 10%;
  margin-bottom: 4px;
`;

const MiniButton = styled(EuiButton)`
  height: 24px !important;
`;

export const TableView = ({
  graph,
  includedKeys,
  legend,
  pagination,
  queryResults,
  secondaryData,
  secondaryView,
  setDataGridView,
  setPageSize,
  setPageIndex,
  setQueryResults,
  setSecondaryData,
  setSecondaryView,
}) => {
  const desiredKeys = includedKeys.split(',').filter((dk) => dk);
  const queries = queryResults
    .map((qr) => ({
      key: qr.key,
      query: pickBy(
        qr.results[0]._source,
        (_value, key) => desiredKeys.find((dk) => dk === key) !== undefined
      ),
    }))
    .filter((q) => legend[q.key] !== undefined);

  const flattenedQueries = queries.map((qr) => ({
    key: qr.key,
    query: flatten(pickBy(qr.query, (value, _key) => !Array.isArray(value))),
  }));

  const fullNames = queries.map((qr) => qr.key);
  const twoLayersOrLess = queries.length <= 2;
  const columnNames = queries.map((qr, i) =>
    twoLayersOrLess ? qr.key : `${String.fromCharCode(65 + i > 90 ? 97 + i - 26 : 65 + i)}`
  );
  const columns = columnNames.map((name, i) => ({
    id: name,
    display: (
      <LayerIcon color={legend[fullNames[i]].color} width={twoLayersOrLess ? null : 25}>
        {name}
      </LayerIcon>
    ),
    actions: false,
  }));

  const arrayKeys = queries.reduce(
    (_prev, cur) => Object.keys(pickBy(cur.query, (value, _key) => Array.isArray(value))),
    []
  );
  const queryKeys = flattenedQueries?.map((fq) => Object.keys(fq.query));
  const largestKeySet = queryKeys.reduce(
    (prev, cur, i, arr) => (cur.length > arr[prev].length ? i : prev),
    0
  );

  const keyList = queryKeys.length
    ? queryKeys[largestKeySet]
        .flat()
        .concat(...arrayKeys)
        .sort((a, b) => {
          if (desiredKeys.indexOf(a) === -1) {
            if (desiredKeys.indexOf(b) === -1) {
              return (
                desiredKeys.indexOf(a.substring(0, a.indexOf('.'))) -
                desiredKeys.indexOf(b.substring(0, b.indexOf('.')))
              );
            }
            return desiredKeys.indexOf(a.substring(0, a.indexOf('.'))) - desiredKeys.indexOf(b);
          }

          return desiredKeys.indexOf(b) === -1
            ? desiredKeys.indexOf(a) - desiredKeys.indexOf(b.substring(0, b.indexOf('.')))
            : desiredKeys.indexOf(a) - desiredKeys.indexOf(b);
        })
    : null;

  return keyList && keyList.length && graph.keys.length === flattenedQueries.length ? (
    secondaryView ? (
      <SecondaryTableView
        data={secondaryData.data}
        keyInfo={secondaryData.keyInfo}
        layerCount={columns.length}
        pagination={pagination}
        setSecondaryView={setSecondaryView}
        setPageSize={setPageSize}
        setPageIndex={setPageIndex}
      />
    ) : (
      <>
        <EuiButtonEmpty
          iconType="arrowLeft"
          color="primary"
          aria-label="Back to visualization"
          id="backToVis"
          size="s"
          onClick={() => {
            setDataGridView(false);
            setQueryResults([]);
          }}
        >
          Back to visualization
        </EuiButtonEmpty>
        <EuiSpacer size="m" />
        {queries.length > 2 ? (
          <PlainList height={Math.min(20 * (queries.length + 1), 150)}>
            {queries.map((qr, i) => (
              <PlainListItem>
                <LayerIcon color={legend[qr.key].color} width={25}>
                  {columnNames[i]}
                </LayerIcon>
                <span style={{ paddingLeft: '1em' }}>{qr.key}</span>
              </PlainListItem>
            ))}
          </PlainList>
        ) : null}
        <EuiSpacer size="s" />
        <EuiDataGrid
          width={1200}
          height={480}
          columns={[{ id: '', actions: false }, ...columns]}
          columnVisibility={{
            visibleColumns: ['', ...columnNames],
            setVisibleColumns: () => {},
          }}
          toolbarVisibility={{
            showColumnSelector: false,
            showStyleSelector: true,
            showFullScreenSelector: true,
          }}
          rowCount={keyList.length}
          renderCellValue={(info) => {
            const isKeyColumn = info.columnId === '';
            const columnData = (
              arrayKeys.find((ak) => ak === keyList[info.rowIndex]) ? queries : flattenedQueries
            ).find((_fq, i) => columnNames[i] === info.columnId)?.query;
            const val = isKeyColumn
              ? keyList[info.rowIndex]
              : columnData[keyList[info.rowIndex]] ?? 'N/A';

            const fullName = fullNames[columnNames.indexOf(info.columnId)];
            return isKeyColumn ? (
              <>
                <b>{val}</b>
              </>
            ) : (
              <>
                {Array.isArray(val) && typeof val[0] === 'object' ? (
                  <MiniButton
                    iconType="tableDensityNormal"
                    color="primary"
                    size="s"
                    fill
                    onClick={() => {
                      setSecondaryData({
                        data: val,
                        keyInfo: { name: fullName, color: legend[fullName].color },
                      });
                      setSecondaryView(true);
                    }}
                  >
                    View Table
                  </MiniButton>
                ) : val === false || val === true ? (
                  val.toString()
                ) : typeof val === 'number' ? (
                  formattedNumber(val, 7)
                ) : typeof val === 'string' &&
                  moment(val, 'YYYY-MM-DDTHH:mm:ss.SSSSSS', true).isValid() ? (
                  val.substr(0, val.indexOf('.'))
                ) : (
                  val
                )}
              </>
            );
          }}
          pagination={{
            ...pagination,
            pageSizeOptions: [5, 10, 25, 50, 100],
            onChangeItemsPerPage: setPageSize,
            onChangePage: setPageIndex,
          }}
        />
      </>
    )
  ) : (
    <>
      <EuiSpacer size="m" />
      <EuiLoadingSpinner size="xl" />
    </>
  );
};
