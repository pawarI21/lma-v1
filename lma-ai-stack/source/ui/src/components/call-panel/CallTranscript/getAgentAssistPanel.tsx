import { Box } from '@awsui/components-react';
import { ICallDetails } from 'components/call-list/types';

interface IGetAgentAssistPanel {
  item: ICallDetails;
}

const isEnabled = process.env.REACT_APP_ENABLE_LEX_AGENT_ASSIST === 'true';

export const GetAgentAssistPanel = ({ item }: IGetAgentAssistPanel) => {
  if (!isEnabled) {
    return null;
  }

  return (
    <div>
      <p className="text-base font-semibold pb-3 border-b">Meeting Assist Bot</p>
      <div>
        <div>
          <iframe
            style={{ border: '0px', height: '68vh', margin: '0' }}
            title="Meeting Assist"
            src={`/index-lexwebui.html?callId=${item.callId}`}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};
