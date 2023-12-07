import { t } from "ttag";
import { useCallback, useState } from "react";

import { Text, Button, Group, Modal, Stack } from "metabase/ui";
import {
  Form,
  FormErrorMessage,
  FormProvider,
  FormSelect,
  FormSubmitButton,
  FormTextInput,
} from "metabase/forms";
import { ApiKeysApi } from "metabase/services";

import { useGroupListQuery } from "metabase/common/hooks";
import { isDefaultGroup } from "metabase/lib/groups";

import { SecretKeyModal } from "./SecretKeyModal";

export const CreateApiKeyModal = ({
  onClose,
  refreshList,
}: {
  onClose: () => void;
  refreshList: () => void;
}) => {
  const [modal, setModal] = useState<"create" | "secretKey">("create");
  const [secretKey, setSecretKey] = useState<string>("");

  const handleSubmit = useCallback(
    async vals => {
      const response = await ApiKeysApi.create(vals);
      setSecretKey(response.masked_key);
      setModal("secretKey");
      refreshList();
    },
    [refreshList],
  );

  const { data: groups, isLoading } = useGroupListQuery();
  if (isLoading || !groups) {
    return null;
  }
  const defaultGroupId = String(groups.find(isDefaultGroup)?.id);

  if (modal === "secretKey") {
    return <SecretKeyModal secretKey={secretKey} onClose={onClose} />;
  }

  if (modal === "create") {
    return (
      <Modal
        size="30rem"
        padding="xl"
        opened
        onClose={onClose}
        title={t`Create a new API Key`}
      >
        <FormProvider
          initialValues={{ group_id: defaultGroupId }}
          onSubmit={handleSubmit}
        >
          {({ dirty }) => (
            <Form>
              <Stack spacing="md">
                <FormTextInput
                  name="name"
                  label={t`Key name`}
                  size="sm"
                  required
                  withAsterisk={false}
                />
                <FormSelect
                  name="group_id"
                  label={t`Select a group to inherit its permissions`}
                  size="sm"
                  data={groups.map(({ id, name }) => ({
                    value: String(id),
                    label: name,
                  }))}
                />
                <Text
                  my="sm"
                  size="sm"
                >{t`We don’t version the Metabase API. We rarely change API endpoints, and almost never remove them, but if you write code that relies on the API, there’s a chance you might have to update your code in the future.`}</Text>
                <FormErrorMessage />
                <Group position="right">
                  <Button onClick={onClose}>{t`Cancel`}</Button>
                  <FormSubmitButton
                    disabled={!dirty}
                    variant="filled"
                    label={t`Create`}
                  />
                </Group>
              </Stack>
            </Form>
          )}
        </FormProvider>
      </Modal>
    );
  }
  return null;
};
