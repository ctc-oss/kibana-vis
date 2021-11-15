import React from 'react';
import { EuiButtonEmpty, EuiDataGrid, EuiSpacer, EuiText } from '@elastic/eui';
import { formattedNumber } from '../defines/radar';
import { LayerIcon } from './TableView';

export interface SecondaryKey {
  name: string;
  color: string;
}

export interface SecondaryData {
  data: any[];
  keyInfo: SecondaryKey;
}

export const SecondaryTableView = ({
  data,
  keyInfo,
  layerCount,
  pagination,
  setSecondaryView,
  setPageSize,
  setPageIndex,
}) => {
  // data should be the array of objects
  // key is the layer name - associated with said data

  const keys = Object.keys(data[0]);

  const columns = keys.map((name) => ({
    id: name,
    display: <span>{name}</span>,
    actions: false,
  }));

  return (
    <>
      <EuiButtonEmpty
        iconType="arrowLeft"
        color="primary"
        aria-label="Back to primary table"
        id="backToVis"
        size="s"
        onClick={() => setSecondaryView(false)}
      >
        Back to {layerCount > 1 ? 'comparison view' : 'layer data'}
      </EuiButtonEmpty>
      <EuiSpacer size="s" />
      <LayerIcon color={keyInfo.color}>
        <EuiText>
          <h3>{keyInfo.name}</h3>
        </EuiText>
      </LayerIcon>
      <EuiSpacer size="s" />
      <EuiDataGrid
        width={1200}
        height={600}
        columns={[{ id: '', actions: false }, ...columns]}
        columnVisibility={{
          visibleColumns: [...keys],
          setVisibleColumns: () => {},
        }}
        toolbarVisibility={{
          showColumnSelector: false,
          showStyleSelector: true,
          showFullScreenSelector: true,
        }}
        rowCount={data[data.length - 1][keys[0]]}
        renderCellValue={(info) => {
          const val = data[info.rowIndex][info.columnId] ?? 'N/A';

          return columns[0].id === info.columnId ? (
            <>
              <b>{val}</b>
            </>
          ) : (
            <>{typeof val === 'number' ? formattedNumber(val, 7) : val}</>
          );
        }}
        pagination={{
          ...pagination,
          // Math.min(queryKeys[i].length, queryKeys[currentLayer].length)
          pageSizeOptions: [5, 10, 25, 50, data.length].sort((a, b) => a - b),
          onChangeItemsPerPage: setPageSize,
          onChangePage: setPageIndex,
        }}
      />
    </>
  );
};
