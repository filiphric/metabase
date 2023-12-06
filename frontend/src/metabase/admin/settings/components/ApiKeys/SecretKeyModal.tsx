import { t } from "ttag";

import { Button, Flex, Group, Modal, Stack, TextInput } from "metabase/ui";
import { DEFAULT_Z_INDEX } from "metabase/components/Popover/constants";
import { Icon } from "metabase/core/components/Icon";

import { CopyWidgetButton } from "./SecretKeyModal.styled";

export const SecretKeyModal = ({ secretKey, onClose }) => (
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
