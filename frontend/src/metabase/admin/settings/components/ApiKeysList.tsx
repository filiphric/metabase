import { t } from "ttag";
import { useEffect, useState } from "react";

import { Button, Stack, Group } from "metabase/ui";
import Breadcrumbs from "metabase/components/Breadcrumbs";
import { ApiKeysApi } from "metabase/services";
import { Icon } from "metabase/core/components/Icon";

export const ApiKeysList = () => {
  const [keyRows, setKeyRows] = useState([]);

  useEffect(() => {
    // :name, :group_id, :created_at, :updated_at, and :masked_key
    ApiKeysApi.list().then(setKeyRows);
    setKeyRows([
      {
        name: "Development API Key",
        group_id: 1,
        creator_id: 1,
        masked_key: "asdfasdfa",
        created_at: "2010 Aug 10",
        updated_at: "2010 Aug 10",
      },
      {
        name: "Production API Key",
        group_id: 1,
        creator_id: 1,
        masked_key: "asdfasdfa",
        created_at: "2010 Aug 10",
        updated_at: "2010 Aug 10",
      },
    ]);
  }, []);

  return (
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
        <Button variant="filled">{t`Create API Key`}</Button>
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
          {keyRows.map(
            ({
              name,
              group_id,
              creator_id,
              masked_key,
              created_at,
              updated_at,
            }) => (
              <tr key={name} className="border-bottom">
                <td>{name}</td>
                <td>{group_id}</td>
                <td>{masked_key}</td>
                <td>{creator_id}</td>
                <td>{updated_at}</td>
                <td>
                  <Group spacing="md">
                    <Icon name="pencil" />
                    <Icon name="trash" />
                  </Group>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </Stack>
  );
};
