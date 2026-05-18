Feature: Control Bar
	Scenario: Control bar can be minimized
		Given I have the control bar open
		When I click on the minimize button
		Then the control bar should be minimized

	Scenario: Control can be maximized
		Given I have the control bar minimized
		When I click on the maximize button
		Then the control bar should be maximized

	Scenario: Control bar can pause the simulation
		Given the control bar is not minimized
		And the simulation is not already paused
		When I check the 'Pause Simulation' button
		Then the simulation will pause

	Scenario: Control bar can resume the simulation
		Given the control bar is not minimized
		And the simulation is already paused
		When I uncheck the 'Pause Simulation' button
		Then the simulation will resume

	Scenario: Control bar can hide orbit lines
		Given the control bar is not minimized
		And the orbit lines are already showing
		When I uncheck the 'Show Orbit Lines' box
		Then the orbit lines will vanish

	Scenario: Control bar can show orbit lines
		Given the control bar is not minimized
		And the orbit lines are hidden
		When I check the 'Show Orbit Lines' box
		Then the orbit lines will appear
		
	Scenario: Control bar can control the simulation speed
		Given the control bar is not minimized
		And the simulation is not paused
		When I change the Time Scale to something other than what it already is
		Then the time scale will change and the simulation will run at a different rate

	Scenario: Control bar can reset the camera
		Given the control bar is not minimized
		And there is a planet being focused on
		When I click 'Reset Camera'
		Then the camera will stop following the planet
		And the 'Focus Planet:' drop down will show 'Free View'
