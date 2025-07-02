import React, { useEffect, useState } from "react";
const sampleData = {
  rows: [
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Inspection",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-04-01 08:00:00",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "3",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-04-01 08:00:00",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "32",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "40",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "99",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "99",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "60-WT-GEARBOX-0001",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "req12456",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "50",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "149",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "149",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "test",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "96",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "10",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "329",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "329",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "test",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "96",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "10",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "328",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "328",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Inspection",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "3",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "37",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "40",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "105",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "105",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FO_1",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Replace part",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "30",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "91",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "91",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "SB01",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Inspection",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "3",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "34",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "40",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "102",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "102",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FO_1",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Inspection",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "3",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "36",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "40",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "104",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "104",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FO_1",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "New",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "tets",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-05-26 08:00:00",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "2",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "TRUE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-06-02 17:00:00",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "44",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "10",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "198",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "198",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "demo",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-06-16 13:00:00",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "2",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "TRUE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-06-16 15:00:00",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "27",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "10",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "86",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "86",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Test",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-06-30 09:00:00",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-06-30 11:00:00",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "28",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "10",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "87",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "87",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Buy and Replace",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "1",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "25",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "75",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "75",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "SB01",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Received from Inventory",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "20",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "50",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "57",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "57",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "create task using wd",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "51",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "150",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "150",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "TEST",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "80",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "296",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "296",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "SIVA-001-001",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Replace Device",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "1",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "22",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "58",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "58",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "SB01",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Released",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "tets",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-05-26 08:00:00",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "12",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "TRUE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
          Value: "2025-06-02 17:00:00",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "44",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "10",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "128",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "128",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Work Started",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Service",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "1",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "26",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "15",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "84",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "84",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "GO",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Work Started",
        },
      ],
    },
    {
      columns: [
        {
          Column: 'DESCRIPTION as "Description"',
          Name: "Description",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "test",
        },
        {
          Column: 'PLANNED_START as "Planned Start"',
          Name: "Planned Start",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column:
            '(SELECT COUNT(*) FROM &AO.JT_EXECUTION_INSTANCE_UIV WHERE TASK_SEQ = JT_TASK_LIGHT_UIV.TASK_SEQ) as "ALLOCATED"',
          Name: "ALLOCATED",
          Type: 2,
          TypeName: "NUMBER",
          Value: "2",
        },
        {
          Column:
            "CASE WHEN PLANNED_FINISH < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('WORKSTARTED')  THEN 1 ELSE 0 END as \"L2F\"",
          Name: "L2F",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            "CASE WHEN PLANNED_START < to_date( '#TODAY#', 'YYYY-MM-DD-HH24.MI.SS' ) AND OBJSTATE IN ('NEW','UNDERPREPARATION','PREPARED','RELEASED')  THEN 1 ELSE 0 END as \"L2S\"",
          Name: "L2S",
          Type: 2,
          TypeName: "NUMBER",
          Value: "0",
        },
        {
          Column:
            '(SELECT &AO.Mobile_Work_Order_Util_API.Is_Task_Transferred_To_Mobile(task_seq) FROM dual) as "TRANSFERRED_TO_MOBILE"',
          Name: "TRANSFERRED_TO_MOBILE",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "FALSE",
        },
        {
          Column: 'PLANNED_FINISH as "Planned Finish"',
          Name: "Planned Finish",
          Type: 93,
          TypeName: "DATE",
        },
        {
          Column: 'PRIORITY_ID as "Priority ID"',
          Name: "Priority ID",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'WO_NO as "Wo No"',
          Name: "Wo No",
          Type: 2,
          TypeName: "NUMBER",
          Value: "1",
        },
        {
          Column: 'WORK_TYPE_ID as "Work Type"',
          Name: "Work Type",
          Type: 12,
          TypeName: "VARCHAR2",
        },
        {
          Column: 'TO_CHAR(TASK_SEQ) as "Task No"',
          Name: "Task No",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "4",
        },
        {
          Column: 'TASK_SEQ as "Task No Nav"',
          Name: "Task No Nav",
          Type: 2,
          TypeName: "NUMBER",
          Value: "4",
        },
        {
          Column: 'REPORTED_OBJECT_ID as "Reported Object ID"',
          Name: "Reported Object ID",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "USOB3.02",
        },
        {
          Column: 'STATE as "State"',
          Name: "State",
          Type: 12,
          TypeName: "VARCHAR2",
          Value: "Reported",
        },
      ],
    },
  ],
};

// Transform function from above
function transformTableData(rawData) {
  if (!rawData || !Array.isArray(rawData.rows) || rawData.rows.length === 0) {
    return {
      columnHeaders: [],
      rows: [],
    };
  }

  const columnHeaders = rawData.rows[0].columns.map((col) => col.Name);

  const rows = rawData.rows.map((row) => {
    const rowData = {};
    row.columns.forEach((col) => {
      rowData[col.Name] = col.Value;
    });
    return rowData;
  });

  return {
    columnHeaders,
    rows,
  };
}

const TableComponent = () => {
  const [transformed, setTransformed] = useState({
    columnHeaders: [],
    rows: [],
  });

  useEffect(() => {
    console.log("Raw Data:", sampleData);

    const result = transformTableData(sampleData);

    console.log("Transformed Data:", result);
    setTransformed(result);
  }, []);

  return (
    <div style={{ padding: "1rem", color: "black" }}>
      <h3>Work Type</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {transformed.columnHeaders.map((header) => (
              <th key={header} style={{ textAlign: "left", padding: "8px" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transformed.rows.map((row, idx) => (
            <tr key={idx}>
              {transformed.columnHeaders.map((header) => (
                <td key={header} style={{ padding: "8px" }}>
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
