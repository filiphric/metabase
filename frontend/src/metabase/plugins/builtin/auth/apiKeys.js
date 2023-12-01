import { updateIn } from "icepick";

import { PLUGIN_ADMIN_SETTINGS_UPDATES } from "metabase/plugins";
import { ApiKeysAuthCard } from "metabase/admin/settings/auth/components/ApiKeysAuthCard";

PLUGIN_ADMIN_SETTINGS_UPDATES.push(sections =>
  updateIn(sections, ["authentication", "settings"], settings => [
    ...settings,
    {
      key: "api-keys-enabled",
      description: null,
      noHeader: true,
      widget: ApiKeysAuthCard,
    },
  ]),
);
