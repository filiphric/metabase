import { t } from "ttag";

import { Text, Button, Group, Modal, Stack } from "metabase/ui";
import { ApiKeysApi } from "metabase/services";

export const DeleteApiKeyModal = ({
  onClose,
  refreshList,
  activeRow,
}: {
  onClose: () => void;
  refreshList: () => void;
  activeRow: any;
}) => {
  return (
    <Modal
      size="30rem"
      padding="xl"
      opened
      onClose={onClose}
      title={t`Delete API Key`}
    >
      <Stack spacing="lg">
        <Text>{t`API key deleted can’t be recovered. You have to create a new key.`}</Text>
        <Group position="right">
          <Button
            color="error.0"
            onClick={onClose}
          >{t`No, don’t delete`}</Button>
          <Button
            variant="filled"
            color="error.0"
            onClick={async () => {
              // TODO: display error message
              await ApiKeysApi.delete({ id: activeRow.id });
              refreshList();
              onClose();
            }}
          >{t`Delete API Key`}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
