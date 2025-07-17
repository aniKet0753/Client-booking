import React, { useEffect, useState } from 'react';
import axios from '../api';

const AgentTreeViewer = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [parentAgent, setParentAgent] = useState(null);
  const [agentTree, setAgentTree] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const res = await axios.get('/api/admin/all-agents-name-id', {
          headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
        });
        setAgents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, []);

  const handleAgentClick = async (agentId) => {
    try {
      setLoadingTree(true);
      const res = await axios.get(`/api/admin/agent/${agentId}/tree`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
      });
      console.log(res);
      setSelectedAgent(res.data.agent);  // Detailed agent data
      setAgentTree(res.data.tree);       // Tree data
      setParentAgent(res.data.parent);   // Parent agent data
    } catch (err) {
      console.error('Error fetching agent tree:', err);
    } finally {
      setLoadingTree(false);
    }
  };

    const renderTree = (node) => {
    if (!node) return null;

    return (
        <div className="flex flex-col items-center relative">
        {/* Node Circle */}
        <div
            className="bg-blue-600 text-white font-medium text-center rounded-full w-28 aspect-square flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-md transition-all"
            onClick={() => handleAgentClick(node.agentID)}
        >
            <div className="text-xs text-center px-1">
            {node.name}
            <br />
            <span className="text-[10px] font-normal">({node.agentID})</span>
            </div>
        </div>

        {/* Connectors + Children */}
        {node.children?.length > 0 && (
            <>
            {/* Vertical line down from the node */}
            <div className="w-0.5 h-6 bg-gray-400" />

            {/* Horizontal connector and child branches */}
            <div className="flex justify-center items-start relative mt-2">
                {/* Horizontal line connecting children */}
                <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-400 z-0" />

                {/* Each child node */}
                {node.children.map((child) => (
                <div key={child._id} className="flex flex-col items-center mx-4 relative z-10">
                    {/* Vertical line from horizontal connector to child node */}
                    <div className="w-0.5 h-4 bg-gray-400" />
                    {renderTree(child)}
                </div>
                ))}
            </div>
            </>
        )}
        </div>
    );
    };


  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <h2 className="font-bold mb-2 text-lg">All Agents</h2>
        {loadingAgents ? (
          <div className="text-center text-gray-500 animate-pulse">Loading agents...</div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent._id}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => handleAgentClick(agent.agentID)}
            >
              <div>{agent.name}</div>
              <small className="text-gray-500">{agent.agentID}</small>
            </div>
          ))
        )}
      </div>

      {/* Right Panel */}
      <div className="w-3/4 p-6 overflow-y-auto">
        {loadingTree ? (
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : agentTree ? (
          <>
            <h3 className="font-bold text-lg mb-4">Downline Tree</h3>
            <div className="flex justify-center">{renderTree(agentTree)}</div>
          </>
        ) : (
          <p>Select an agent from the left panel to view tree and details.</p>
        )}

        {parentAgent && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
            <h3 className="font-semibold mb-1">Parent Agent</h3>
            <p><strong>Name:</strong> {parentAgent.name}</p>
            <p><strong>Agent ID:</strong> {parentAgent.agentID}</p>
        </div>
        )}

        {!loadingTree && selectedAgent && (
          <>
            <hr className="my-6" />
            <h2 className="text-2xl font-semibold mb-2">Agent Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <p><strong>Name:</strong> {selectedAgent.name}</p>
              <p><strong>Gender:</strong> {selectedAgent.gender}</p>
              <p><strong>DOB:</strong> {new Date(selectedAgent.dob).toLocaleDateString()}</p>
              <p><strong>Age:</strong> {selectedAgent.age}</p>
              <p><strong>Email:</strong> {selectedAgent.email}</p>
              <p><strong>Phone (Calling):</strong> {selectedAgent.phone_calling}</p>
              <p><strong>Phone (WhatsApp):</strong> {selectedAgent.phone_whatsapp}</p>
              <p><strong>Status:</strong> {selectedAgent.status}</p>
              <p><strong>Profession:</strong> {selectedAgent.profession}</p>
              <p><strong>Income:</strong> ₹{selectedAgent.income}</p>
              <p><strong>Agent ID:</strong> {selectedAgent.agentID}</p>
              <p><strong>Remarks:</strong> {selectedAgent.remarks}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Documents</h3>
              <p><strong>Aadhaar:</strong> {selectedAgent.aadhar_card}</p>
              <p><strong>PAN:</strong> {selectedAgent.pan_card}</p>
              <div className="flex gap-4 mt-2">
                <img src={selectedAgent.aadhaarPhotoFront} alt="Aadhaar Front" className="w-32 border" />
                <img src={selectedAgent.aadhaarPhotoBack} alt="Aadhaar Back" className="w-32 border" />
                <img src={selectedAgent.panCardPhoto} alt="PAN Card" className="w-32 border" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Permanent Address</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedAgent.permanent_address || {}).map(([key, value]) => (
                  <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
                ))}
              </div>
              <p className="mt-2"><strong>Office Address:</strong> {selectedAgent.office_address}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Exclusive Zones</h3>
              {(selectedAgent.exclusive_zone || []).map((zone, idx) => (
                <div key={idx} className="mb-2">
                  <p><strong>Pincode:</strong> {zone.pincode}</p>
                  <p><strong>Village Preferences:</strong> {zone.village_preference.join(', ')}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Banking Details</h3>
              {Object.entries(selectedAgent.banking_details || {}).map(([key, value]) => (
                <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentTreeViewer;