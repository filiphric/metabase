import { t } from "ttag";
import { useEffect, useState } from "react";

import { Modal, Button, Stack, Group } from "metabase/ui";

import Breadcrumbs from "metabase/components/Breadcrumbs";
import { ApiKeysApi } from "metabase/services";
import { Icon } from "metabase/core/components/Icon";
import { Form, FormProvider } from "metabase/forms";

export const CreateApiKeyModal = ({ handleClose }) => {
  return (
    <Modal
      padding="xl"
      opened
      onClose={handleClose}
      title={t`Create a new API Key`}
    />
  );
};

export const EditApiKeyModal = ({ handleClose }) => {
  return (
    <Modal padding="xl" opened onClose={handleClose} title={t`Edit API Key`} />
  );
};

export const DeleteApiKeyModal = ({
  handleClose,
  handleRefresh,
  activeRow,
}) => {
  return (
    <Modal
      size="30rem"
      padding="xl"
      opened
      onClose={handleClose}
      title={t`Delete API Key`}
    >
      <Stack>
        <p>{t`API key deleted can’t be recovered. You have to create a new key.`}</p>
        <Group position="right">
          <Button
            color="error.0"
            onClick={handleClose}
          >{t`No, don’t delete`}</Button>
          <Button
            variant="filled"
            color="error.0"
            onClick={async () => {
              await ApiKeysApi.delete({ id: activeRow.id });
              handleClose();
              handleRefresh();
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
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const handleRefresh = () => ApiKeysApi.list().then(setKeyRows);

  useEffect(() => {
    // :name, :group_id, :created_at, :updated_at, and :masked_key
    ApiKeysApi.list().then(setKeyRows);
    setKeyRows(MOCK_ROWS);
  }, []);

  return (
    <>
      {isCreating ? (
        <CreateApiKeyModal handleClose={() => setIsCreating(false)} />
      ) : isEditing ? (
        <EditApiKeyModal handleClose={() => setIsEditing(false)} />
      ) : isDeleting ? (
        <DeleteApiKeyModal
          activeRow={activeRow}
          handleRefresh={handleRefresh}
          handleClose={() => setIsDeleting(false)}
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
            onClick={() => setIsCreating(true)}
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
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer"
                    />
                    <Icon
                      name="trash"
                      onClick={() => {
                        setIsDeleting(true);
                        setActiveRow(row);
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
