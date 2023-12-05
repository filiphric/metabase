import { t } from "ttag";
import { useEffect, useState } from "react";

import { Flex, Modal, Button, Stack, Group, TextInput } from "metabase/ui";

import Breadcrumbs from "metabase/components/Breadcrumbs";
import { ApiKeysApi } from "metabase/services";
import { Icon } from "metabase/core/components/Icon";
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
import { DEFAULT_Z_INDEX } from "metabase/components/Popover/constants";
import { CopyWidgetButton } from "./ApiKeysList.styled";

const SecretKeyModal = ({ secretKey, onClose }) => (
  <Modal
    zIndex={DEFAULT_Z_INDEX} // prevents CopyWidgetButton’s Tippy popover from being obscured
    padding="xl"
    opened
    onClose={onClose}
    title={t`Copy and save the API key`}
  >
    <Stack spacing="xl">
      <TextInput
        label={t`The API key`}
        value={secretKey}
        readOnly
        rightSection={<CopyWidgetButton value={secretKey} />}
        disabled
        styles={{ input: { color: `black !important` } }}
      />
      <Flex direction="row" gap="md" className="text-medium">
        <Icon name="info_filled" size={22} style={{ marginTop: "-4px" }} />
        <span className="text-small">{t`Please copy this key and save it somewhere safe. For security reasons, we can’t show it to you again.`}</span>
      </Flex>
      <Group position="right">
        <Button onClick={onClose} variant="filled">{t`Done`}</Button>
      </Group>
    </Stack>
  </Modal>
);

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
          <Form>
            <Stack spacing="md">
              <FormTextInput name="name" label={t`Key name`} />
              <FormSelect
                name="group_id"
                label={t`Select a group to inherit its permissions`}
                data={groups.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
              />
              <p className="text-small">{t`We don’t version the Metabase API. We rarely change API endpoints, and almost never remove them, but if you write code that relies on the API, there’s a chance you might have to update your code in the future.`}</p>
              <FormErrorMessage />
              <Group position="right">
                <Button onClick={onClose}>{t`Cancel`}</Button>
                <FormSubmitButton variant="filled" label={t`Create`} />
              </Group>
            </Stack>
          </Form>
        </FormProvider>
      </Modal>
    );
  }
  return null;
};

export const EditApiKeyModal = ({ onClose, activeRow }) => {
  const [modal, setModal] = useState<"edit" | "regenerate" | "secretKey">(
    "edit",
  );
  const [secretKey, setSecretKey] = useState(null);
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
        padding="xl"
        opened
        onClose={() => setModal("edit")}
        title={t`Regenerate API key`}
      >
        <Stack spacing="xl">
          <Stack spacing="xs">
            <label className="text-bold text-light">{t`Key name`}</label>
            <span className="text-bold">{activeRow.name}</span>
          </Stack>
          <Stack spacing="xs">
            <label className="text-bold text-light">{t`Group`}</label>
            <span className="text-bold">{activeRow.group_name}</span>
          </Stack>
          <div>{t`The existing API key will be deleted and cannot be recovered. It will be replaced with a new key.`}</div>
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
              }}
            >{t`Regenerate`}</Button>
          </Group>
        </Stack>
      </Modal>
    );
  }

  if (modal === "edit") {
    return (
      <Modal padding="xl" opened onClose={onClose} title={t`Edit API Key`}>
        <FormProvider
          initialValues={{ ...activeRow, masked_key: maskedKey }}
          onSubmit={async vals => {
            await ApiKeysApi.edit({
              id: vals.id,
              group_id: vals.group_id,
              name: vals.name,
            });
            onClose();
          }}
        >
          {({ dirty }) => (
            <Form>
              <Stack spacing="md">
                <FormTextInput name="name" label={t`Key name`} />
                <FormSelect
                  name="group_id"
                  label={t`Select a group to inherit its permissions`}
                  data={groups.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  }))}
                />
                <FormTextInput name="masked_key" label={t`API Key`} disabled />
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
                      label={t`Create`}
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

export const DeleteApiKeyModal = ({ onClose, refreshList, activeRow }) => {
  return (
    <Modal
      size="30rem"
      padding="xl"
      opened
      onClose={onClose}
      title={t`Delete API Key`}
    >
      <Stack>
        <p>{t`API key deleted can’t be recovered. You have to create a new key.`}</p>
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
              onClose();
              refreshList();
            }}
          >{t`Delete API Key`}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

const MOCK_ROWS = [
  {
    name: "Development API Key",
    id: 1,
    group_id: 1,
    group_name: "All Users",
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
  {
    name: "Production API Key",
    id: 2,
    group_id: 1,
    group_name: "All Users",
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
];

export const ApiKeysList = () => {
  const [keyRows, setKeyRows] = useState([]);
  const [modal, setModal] = useState<null | "create" | "edit" | "delete">(null);
  const [activeRow, setActiveRow] = useState(null);
  const refreshList = () => ApiKeysApi.list().then(setKeyRows);
  const handleClose = () => setModal(null);

  useEffect(() => {
    // :name, :group_id, :created_at, :updated_at, and :masked_key
    ApiKeysApi.list().then(setKeyRows);
    setKeyRows(MOCK_ROWS);
  }, []);

  return (
    <>
      {modal === "create" ? (
        <CreateApiKeyModal onClose={handleClose} />
      ) : modal === "edit" ? (
        <EditApiKeyModal onClose={handleClose} activeRow={activeRow} />
      ) : modal === "delete" ? (
        <DeleteApiKeyModal
          activeRow={activeRow}
          refreshList={refreshList}
          onClose={handleClose}
        />
      ) : null}
      <Stack pl="md">
        <Breadcrumbs
          className="mb3"
          crumbs={[
            [t`Authentication`, "/admin/settings/authentication"],
            [t`API Keys`],
          ]}
        />
        <Group align="end" position="apart">
          <Stack>
            <h2>{t`Manage API Keys`}</h2>
            <p>{t`Allow users to use the API keys to authenticate their API calls.`}</p>
          </Stack>
          <Button
            variant="filled"
            onClick={() => setModal("create")}
          >{t`Create API Key`}</Button>
        </Group>
        <table className="ContentTable border-bottom">
          <thead>
            <tr>
              <th>{t`Key name`}</th>
              <th>{t`Group`}</th>
              <th>{t`Key`}</th>
              <th>{t`Last Modified By`}</th>
              <th>{t`Last Modified On`}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {keyRows.map(row => (
              <tr key={row.id} className="border-bottom">
                <td className="text-bold">{row.name}</td>
                <td>{row.group_id}</td>
                <td>{row.masked_key}</td>
                <td>{row.creator_id}</td>
                <td>{row.updated_at}</td>
                <td>
                  <Group spacing="md">
                    <Icon
                      name="pencil"
                      onClick={() => {
                        setActiveRow(row);
                        setModal("edit");
                      }}
                      className="cursor-pointer"
                    />
                    <Icon
                      name="trash"
                      onClick={() => {
                        setActiveRow(row);
                        setModal("delete");
                      }}
                      className="cursor-pointer"
                    />
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Stack>
    </>
  );
};
