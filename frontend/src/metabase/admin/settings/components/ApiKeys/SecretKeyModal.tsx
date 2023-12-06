import { t } from "ttag";

import {
  Text,
  Button,
  Flex,
  Group,
  Modal,
  Stack,
  TextInput,
} from "metabase/ui";
import { DEFAULT_Z_INDEX } from "metabase/components/Popover/constants";
import { Icon } from "metabase/core/components/Icon";

import { CopyWidgetButton } from "./SecretKeyModal.styled";

export const SecretKeyModal = ({
  secretKey,
  onClose,
}: {
  secretKey: string;
  onClose: () => void;
}) => (
  <Modal
    size="30rem"
    padding="xl"
    zIndex={DEFAULT_Z_INDEX} // prevents CopyWidgetButton’s Tippy popover from being obscured
    opened
    onClose={onClose}
    title={t`Copy and save the API key`}
  >
    <Stack spacing="xl">
      <TextInput
        label={t`The API key`}
        size="sm"
        value={secretKey}
        readOnly
        rightSection={<CopyWidgetButton value={secretKey} />}
        disabled
        styles={{
          input: {
            color: `black !important`,
            fontFamily: "Monaco, monospace",
          },
        }}
      />
      <Flex direction="row" gap="md">
        <Icon
          name="info_filled"
          size={22}
          className="text-medium"
          style={{ marginTop: "-4px" }}
        />
        <Text
          size="sm"
          color="text.1"
        >{t`Please copy this key and save it somewhere safe. For security reasons, we can’t show it to you again.`}</Text>
      </Flex>
      <Group position="right">
        <Button onClick={onClose} variant="filled">{t`Done`}</Button>
      </Group>
    </Stack>
  </Modal>
);
