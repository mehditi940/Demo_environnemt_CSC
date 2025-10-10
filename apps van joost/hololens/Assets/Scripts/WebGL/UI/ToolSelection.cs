using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public enum Tool
{
    None,
    DrawTool,
    DragTool,
}

public class ToolSelection : MonoBehaviour
{
    public static ToolSelection Instance;

    private List<ToolButton> toolButtons = new();
    public Tool selectedTool = Tool.None;

    private void Start()
    {
        if (Instance == null)
        {
            Instance = this;
        } else if (Instance != this)
        {
            GameObject.Destroy(this);
        }

        foreach (ToolButton button in transform.GetComponentsInChildren<ToolButton>())
        {
            toolButtons.Add(button);
        }
    }

    public void RegisterToolButton(ToolButton toolButton)
    {
        toolButtons.Add(toolButton);
    }

    public void SetActiveTool(ToolButton button, Tool tool)
    {
        // Deactivate all other tool buttons
        foreach (ToolButton toolButton in toolButtons)
        {
            if (button != null && toolButton != button)
            {
                Toggle toggle = toolButton.GetComponent<Toggle>();
                if (toggle != null)
                {
                    toggle.isOn = false;
                    
                }
            }
        }
        selectedTool = tool;
    }
}