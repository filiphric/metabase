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

import { useGroupListQuery } from "metabase/common/hooks";
import { isDefaultGroup } from "metabase/lib/groups";

import { SecretKeyModal } from "./SecretKeyModal";

export const CreateApiKeyModal = ({ onClose }) => {
  const [modal, setModal] = useState<"create" | "secretKey">("create");
  const [secretKey, setSecretKey] = useState(null);

  const { data: groups, isLoading } = useGroupListQuery();
  if (isLoading || !groups) {
    return null;
  }

  if (modal === "secretKey") {
    return <SecretKeyModal secretKey={secretKey} onClose={onClose} />;
  }

  if (modal === "create") {
    return (
      <Modal
        padding="xl"
        opened
        onClose={onClose}
        title={t`Create a new API Key`}
      >
        <FormProvider
          initialValues={{
            group_id: groups.find(isDefaultGroup)?.id,
          }}
          onSubmit={async vals => {
            setSecretKey("1234567890");
            setModal("secretKey");
            // await ApiKeysApi.create(vals);
            // TODO: is loading state handled already by the FormProvider?
            // onClose(); // TODO: should we delay this before closing the modal?
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
