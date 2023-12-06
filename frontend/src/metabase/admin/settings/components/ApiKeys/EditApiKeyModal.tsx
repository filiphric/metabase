import { t } from "ttag";
import { useState } from "react";

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

import { SecretKeyModal } from "./SecretKeyModal";

export const EditApiKeyModal = ({
  onClose,
  refreshList,
  activeRow,
}: {
  onClose: () => void;
  refreshList: () => void;
  activeRow: any;
}) => {
  const [modal, setModal] = useState<"edit" | "regenerate" | "secretKey">(
    "edit",
  );
  const [secretKey, setSecretKey] = useState<string>("");
  const [maskedKey, setMaskedKey] = useState<string>(activeRow.masked_key);

  const { data: groups, isLoading } = useGroupListQuery();
  if (isLoading || !groups) {
    return null;
  }

  if (modal === "secretKey") {
    return (
      <SecretKeyModal secretKey={secretKey} onClose={() => setModal("edit")} />
    );
  }

  if (modal === "regenerate") {
    return (
      <Modal
        size="30rem"
        padding="xl"
        opened
        onClose={() => setModal("edit")}
        title={t`Regenerate API key`}
      >
        <Stack spacing="lg">
          <Stack spacing="xs">
            <Text
              component="label"
              weight="bold"
              color="text.0"
              size="sm"
            >{t`Key name`}</Text>
            <Text weight="bold" size="sm">
              {activeRow.name}
            </Text>
          </Stack>
          <Stack spacing="xs">
            <Text
              component="label"
              weight="bold"
              color="text.0"
              size="sm"
            >{t`Group`}</Text>
            <Text weight="bold" size="sm">
              {activeRow.group_name}
            </Text>
          </Stack>
          <Text>{t`The existing API key will be deleted and cannot be recovered. It will be replaced with a new key.`}</Text>
          <Group position="right">
            <Button
              onClick={() => setModal("edit")}
            >{t`No, don’t regenerate`}</Button>
            <Button
              variant="filled"
              onClick={async () => {
                const result = await ApiKeysApi.regenerate({
                  id: activeRow.id,
                });
                setMaskedKey(result.masked_key);
                setSecretKey(result.unmasked_key);
                setModal("secretKey");
                refreshList();
              }}
            >{t`Regenerate`}</Button>
          </Group>
        </Stack>
      </Modal>
    );
  }

  if (modal === "edit") {
    return (
      <Modal
        size="30rem"
        padding="xl"
        opened
        onClose={onClose}
        title={t`Edit API Key`}
      >
        <FormProvider
          initialValues={{ ...activeRow, masked_key: maskedKey }}
          onSubmit={async vals => {
            await ApiKeysApi.edit({
              id: vals.id,
              group_id: vals.group_id,
              name: vals.name,
            });
            refreshList();
            onClose();
          }}
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
                    value: id,
                    label: name,
                  }))}
                />
                <FormTextInput
                  name="masked_key"
                  label={t`API Key`}
                  size="sm"
                  styles={{ input: { fontFamily: "Monaco, monospace" } }}
                  disabled
                />
                <FormErrorMessage />
                <Group position="apart" mt="lg">
                  <Button
                    onClick={() => setModal("regenerate")}
                  >{t`Regenerate API Key`}</Button>
                  <Group position="right">
                    <Button onClick={onClose}>{t`Cancel`}</Button>
                    <FormSubmitButton
                      disabled={!dirty}
                      variant="filled"
                      label={t`Save`}
                    />
                  </Group>
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
