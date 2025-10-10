#if ENABLE_WEBRTC

using System.Collections;
using Unity.WebRTC;
using UnityEngine;

public class WebRTCStreamer : MonoBehaviour
{

    public SocketConnector socketConnector;
    RTCPeerConnection peerConnection;
    StartStreamBody stunServers;

    RTCPeerConnection pc;
    RTCSessionDescription offer;

    private void Awake()
    {
        DontDestroyOnLoad(this);
    }

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    async void Start()
    {
        socketConnector.onStartStream.AddListener(OnStartStream);

        await socketConnector.StartStream();

        StartCoroutine(WebRTC.Update());

        StartCoroutine(StartConnection());
    }


    private void OnStartStream(StartStreamBody startStreamBody)
    {
        stunServers = startStreamBody;
    }

    private IEnumerator StartConnection()
    {
        var camera = GetComponent<Camera>();
        var track = camera.CaptureStreamTrack(1280, 720);

        var config = new RTCConfiguration
        {
            iceServers = new[]
            {
                new RTCIceServer { urls = new[] { "stun:stun.l.google.com:19302" } }
            }
        };

        pc = new RTCPeerConnection(ref config);
        pc.AddTrack(track);

        // ICE gathering  
        pc.OnIceCandidate = (RTCIceCandidate candidate) =>
        {
            if (candidate != null)
            {
                socketConnector.SendCanidate(new SendCanidateBody
                {
                    canidate = candidate.Candidate,
                    type = "candidate",
                }); 
            }
        };

        var op = pc.CreateOffer();
        yield return op;

        var localDescription = op.Desc; // Store the description in a variable  
        yield return pc.SetLocalDescription(ref localDescription); // Pass the variable instead of the property  

        offer = localDescription;

        socketConnector.SendOffer(new SendOfferBody { offer = offer.sdp, type = "offer"});
        
    }
}
#endif