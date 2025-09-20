using System;
using Microsoft.MixedReality.OpenXR;
using UnityEngine;
using UnityEngine.SceneManagement;

public class QrCodeScanner : MonoBehaviour
{
    private ARMarkerManager markerManager;

    public string socketURL;
    public string roomId;

    private void Awake()
    {
        DontDestroyOnLoad(this);
        markerManager = GetComponent<ARMarkerManager>();
        markerManager.markersChanged += OnMarkersChanged;
        SceneManager.LoadScene("ViewerScreen");
    }

    void OnDestroy()
    {
        markerManager.markersChanged -= OnMarkersChanged;
    }

    void OnMarkersChanged(ARMarkersChangedEventArgs args)
    {
        foreach (var marker in args.added)
        {
            string qrText = marker.GetDecodedString();

            // Try parsing as JSON
            try
            {
                var parsed = JsonUtility.FromJson<QRCodeData>(qrText);
                Debug.Log($"QR Data: roomId={parsed.roomId}, socketUrl={parsed.socketUrl}");
            }
            catch
            {
                Debug.Log($"Raw QR Code Text: {qrText}");
            }

            // Use marker.pose if you want to place an object at the QR code location
        }
    }

    [Serializable]
    public class QRCodeData
    {
        public string roomId;
        public string socketUrl;
    }
}
