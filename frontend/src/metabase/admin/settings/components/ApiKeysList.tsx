import { t } from "ttag";
import { useEffect, useState } from "react";

import { Modal, Button, Stack, Group } from "metabase/ui";
import GroupEntity from "metabase/entities/groups";

import Breadcrumbs from "metabase/components/Breadcrumbs";
import { ApiKeysApi } from "metabase/services";
import { Icon } from "metabase/core/components/Icon";
import {
  Form,
  FormProvider,
  FormSelect,
  FormSubmitButton,
  FormTextInput,
} from "metabase/forms";
import { useSelector } from "metabase/lib/redux";

export const CreateApiKeyModal = ({ onClose }) => {
  const groups = useSelector(GroupEntity.selectors.getList);
  return (
    <Modal
      padding="xl"
      opened
      onClose={onClose}
      title={t`Create a new API Key`}
    >
      <FormProvider
        initialValues={{}}
        onSubmit={async vals => {
          await ApiKeysApi.create(vals);
          onClose();
          // TODO: loading
          // TODO: error state
        }}
      >
        <Form>
          <Stack spacing="md">
            <FormTextInput name="name" label={t`Key name`} />
            <FormSelect
              name="group_id"
              label={t`Select a group to inherit its permissions`}
              data={[]}
            />
            <p className="text-small">{t`We don't version the Metabase API. We rarely change API endpoints, and almost never remove them, but if you write code that relies on the API, there's a chance you might have to update your code in the future.`}</p>
            <Group position="right">
              <Button onClick={onClose}>{t`Cancel`}</Button>
              <FormSubmitButton variant="filled" label={t`Create`} />
            </Group>
          </Stack>
        </Form>
      </FormProvider>
    </Modal>
  );
};

export const EditApiKeyModal = ({ onClose }) => {
  return (
    <Modal padding="xl" opened onClose={onClose} title={t`Edit API Key`} />
  );
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
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
  {
    name: "Production API Key",
    id: 2,
    group_id: 1,
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
];

export const ApiKeysList = () => {
  const [keyRows, setKeyRows] = useState([]);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
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
        <EditApiKeyModal onClose={handleClose} />
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
                      onClick={() => setModal("edit")}
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
