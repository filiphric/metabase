/* eslint-disable react/prop-types */
import { Component } from "react";
import PropTypes from "prop-types";

import { t } from "ttag";
// eslint-disable-next-line no-restricted-imports -- deprecated usage
import moment from "moment-timezone";
import UserAvatar from "metabase/components/UserAvatar";

import RevisionDiff from "./RevisionDiff";

export default class Revision extends Component {
  static propTypes = {
    objectName: PropTypes.string.isRequired,
    revision: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    tableMetadata: PropTypes.object.isRequired,
  };

  getAction() {
    const { revision, objectName } = this.props;
    if (revision.is_creation) {
      return t`created` + ' "' + revision.diff.name.after + '"';
    }
    if (revision.is_reversion) {
      return t`reverted to a previous version`;
    }
    const changedKeys = Object.keys(revision.diff || {});
    if (changedKeys.length === 1) {
      switch (changedKeys[0]) {
        case "name":
          return t`edited the title`;
        case "description":
          return t`edited the description`;
        case "defintion":
          return t`edited the ` + objectName;
      }
    }
    return t`made some changes`;
  }

  getName() {
    const {
      revision: { user },
      currentUser,
    } = this.props;
    if (user.id === currentUser.id) {
      return t`You`;
    } else {
      return user.common_name;
    }
  }

  render() {
    const { revision, tableMetadata, userColor } = this.props;

    let message = revision.message;
    let diffKeys = Object.keys(revision.diff || {});

    if (revision.is_creation) {
      // these are included in the
      message = revision.diff.description.after;
      diffKeys = diffKeys.filter(k => k !== "name" && k !== "description");
    }

    return (
      <li className="flex flex-row">
        <div className="flex flex-column align-center mr2">
          <div className="text-white">
            <UserAvatar user={revision.user} bg={userColor} />
          </div>
          <div
            className="flex-full my1 border-left"
            style={{ borderWidth: 2 }}
          />
        </div>
        <div className="flex-full mt1 mb4">
          <div className="flex mb1 text-medium">
            <span className="">
              <strong>{this.getName()}</strong> {this.getAction()}
            </span>
            <span className="flex-align-right h5">
              {moment(revision.timestamp).format("MMMM DD, YYYY")}
            </span>
          </div>
          {message && <p>&quot;{message}&quot;</p>}
          {diffKeys.map(key => (
            <RevisionDiff
              key={key}
              property={key}
              diff={revision.diff[key]}
              tableMetadata={tableMetadata}
            />
          ))}
        </div>
      </li>
    );
  }
}
