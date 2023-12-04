import { t } from "ttag";

export const ApiKeysList = () => {
  return (
    <section className="pb4">
      <table className="ContentTable border-bottom">
        <thead>
          <tr>
            <th>{t`Key name`}</th>
            <th>{t`Group`}</th>
            <th>{t`Key`}</th>
            <th>{t`Last Modified By`}</th>
            <th>{t`Last Modified On`}</th>
          </tr>
        </thead>
      </table>
    </section>
  );
};
