import { t } from "ttag";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
        {error && <Text color="error.0">{error}</Text>}
        <Group position="right">
          <Button
            color="error.0"
            onClick={onClose}
          >{t`No, don’t delete`}</Button>
          <Button
            disabled={isLoading}
            variant="filled"
            color="error.0"
            onClick={async () => {
              setIsLoading(true);
              try {
                await ApiKeysApi.delete({ id: activeRow.id });
                refreshList();
                onClose();
              } catch (err) {
                setError(err.data); // TODO: another way to handle this?
              } finally {
                setIsLoading(false);
              }
            }}
          >{t`Delete API Key`}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
