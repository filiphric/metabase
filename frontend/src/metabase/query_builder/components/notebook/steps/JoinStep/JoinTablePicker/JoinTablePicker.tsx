import { useMemo } from "react";
import { t } from "ttag";

import { Icon } from "metabase/core/components/Icon";
import Tooltip from "metabase/core/components/Tooltip";
import { FieldPicker } from "metabase/common/components/FieldPicker";
import TippyPopoverWithTrigger from "metabase/components/PopoverWithTrigger/TippyPopoverWithTrigger";
import { DataSourceSelector } from "metabase/query_builder/components/DataSelector";

import { getMetadata } from "metabase/selectors/metadata";
import { useSelector } from "metabase/lib/redux";
import * as Lib from "metabase-lib";
import type Table from "metabase-lib/metadata/Table";

import { NotebookCellItem } from "../../../NotebookCell";
import { FIELDS_PICKER_STYLES } from "../../../FieldsPickerIcon";
import { PickerButton, ColumnPickerButton } from "./JoinTablePicker.styled";

interface JoinTablePickerProps {
  query: Lib.Query;
  stageIndex: number;
  columns?: Lib.ColumnMetadata[];
  table?: Lib.CardMetadata | Lib.TableMetadata;
  readOnly?: boolean;
  color: string;
  isColumnSelected: (column: Lib.ColumnMetadata) => boolean;
  onChangeTable: (joinable: Lib.Joinable) => void;
  onChangeFields: (columns: Lib.JoinFields) => void;
}

export function JoinTablePicker({
  query,
  stageIndex,
  columns = [],
  table,
  readOnly = false,
  color,
  isColumnSelected,
  onChangeTable,
  onChangeFields,
}: JoinTablePickerProps) {
  const metadata = useSelector(getMetadata);

  const tableInfo = table ? Lib.displayInfo(query, stageIndex, table) : null;
  const pickerInfo = table ? Lib.pickerInfo(query, table) : null;

  const databaseId = pickerInfo?.databaseId || Lib.databaseID(query);
  const tableId = pickerInfo?.tableId || pickerInfo?.cardId;

  const databases = useMemo(() => {
    const database = metadata.database(databaseId);
    return [database, metadata.savedQuestionsDatabase()].filter(Boolean);
  }, [databaseId, metadata]);

  const handleTableChange = (tableId: number | string) =>
    onChangeTable(Lib.tableOrCardMetadata(query, tableId));

  const tableFilter = (table: Table) => !tableId || table.db_id === databaseId;

  return (
    <NotebookCellItem
      inactive={!table}
      readOnly={readOnly}
      color={color}
      aria-label={t`Right table`}
      right={
        table ? (
          <JoinTableColumnsPicker
            query={query}
            stageIndex={stageIndex}
            columns={columns}
            isColumnSelected={isColumnSelected}
            onChange={onChangeFields}
          />
        ) : null
      }
      rightContainerStyle={FIELDS_PICKER_STYLES.notebookRightItemContainer}
    >
      <DataSourceSelector
        hasTableSearch
        canChangeDatabase={false}
        isInitiallyOpen={!table}
        databases={databases}
        tableFilter={tableFilter}
        selectedDatabaseId={databaseId}
        selectedTableId={tableId}
        setSourceTableFn={handleTableChange}
        triggerElement={
          <PickerButton>
            {tableInfo?.displayName || t`Pick a table…`}
          </PickerButton>
        }
      />
    </NotebookCellItem>
  );
}

interface JoinTableColumnsPickerProps {
  query: Lib.Query;
  stageIndex: number;
  columns: Lib.ColumnMetadata[];
  isColumnSelected: (column: Lib.ColumnMetadata) => boolean;
  onChange: (columns: Lib.JoinFields) => void;
}

function JoinTableColumnsPicker({
  query,
  stageIndex,
  columns,
  isColumnSelected,
  onChange,
}: JoinTableColumnsPickerProps) {
  const handleToggle = (changedIndex: number, isSelected: boolean) => {
    const nextColumns = columns.filter((_, currentIndex) =>
      currentIndex === changedIndex
        ? isSelected
        : isColumnSelected(columns[currentIndex]),
    );
    onChange(nextColumns);
  };

  const handleSelectAll = () => {
    onChange("all");
  };

  const handleSelectNone = () => {
    onChange("none");
  };

  return (
    <TippyPopoverWithTrigger
      popoverContent={
        <FieldPicker
          query={query}
          stageIndex={stageIndex}
          columns={columns}
          isColumnSelected={isColumnSelected}
          onToggle={handleToggle}
          onSelectAll={handleSelectAll}
          onSelectNone={handleSelectNone}
          data-testid="join-columns-picker"
        />
      }
      renderTrigger={({ onClick }) => (
        <div>
          <Tooltip tooltip={t`Pick columns`}>
            <ColumnPickerButton
              onClick={onClick}
              aria-label={t`Pick columns`}
              data-testid="fields-picker"
            >
              <Icon name="chevrondown" />
            </ColumnPickerButton>
          </Tooltip>
        </div>
      )}
    />
  );
}
