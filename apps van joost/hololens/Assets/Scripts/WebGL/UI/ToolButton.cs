using UnityEngine;
using UnityEngine.UI;

public class ToolButton : MonoBehaviour
{
    private Toggle toggle;
    public Tool tool;

    public static ColorBlock deselectedColors = new ColorBlock
    {
        normalColor = Color.white,
        selectedColor = Color.white,
        highlightedColor = Color.white,
        pressedColor = Color.white,
        disabledColor = Color.gray,
        colorMultiplier = 1f,
        fadeDuration = 0.1f
    };
    public static ColorBlock selectedColors = new ColorBlock
    {
        normalColor = Color.green,
        selectedColor = Color.green,
        highlightedColor = Color.green,
        pressedColor = Color.green,
        disabledColor = Color.gray,
        colorMultiplier = 1f,
        fadeDuration = 0.1f
    };

    private void Start()
    {
        ToolSelection.Instance.RegisterToolButton(this);

        toggle = GetComponent<Toggle>();
        toggle.onValueChanged.AddListener(delegate { OnToggleChanged(toggle); });
    }

    private void OnToggleChanged(Toggle change)
    {
        if (change.isOn)
        {
            ToolSelection.Instance.SetActiveTool(this, tool);
            toggle.colors = selectedColors;
        } else
        {
            toggle.colors = deselectedColors;
            ToolSelection.Instance.SetActiveTool(null, Tool.None);
        }
    }
}
