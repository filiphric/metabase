import { t } from "ttag";
import { Link } from "react-router";
import Button from "metabase/core/components/Button";
import {
  CardBadge,
  CardDescription,
  CardHeader,
  CardRoot,
  CardTitle,
} from "./AuthCard/AuthCard.styled";

export const ApiKeysAuthCard = () => {
  const count = 0; // TODO: use selector to get number of API keys
  const isConfigured = count > 0;
  return (
    <CardRoot>
      <CardHeader>
        <CardTitle>{t`API Keys`}</CardTitle>
        {isConfigured && (
          <CardBadge isEnabled>
            {count === 1 ? t`1 API Key` : t`${count} API Keys`}
          </CardBadge>
        )}
      </CardHeader>
      <CardDescription>{t`Allow users to use the API keys to authenticate their API calls.`}</CardDescription>
      <Button as={Link} to={`/admin/settings/authentication/api-keys`}>
        {isConfigured ? t`Manage` : t`Set up`}
      </Button>
    </CardRoot>
  );
};
