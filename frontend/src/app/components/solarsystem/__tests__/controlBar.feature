Feature: Control Bar Interactions

  The control bar allows users to toggle, change time scale, control the simulation, and focus on planets.

  Scenario: Control bar can be minimized
    Given the control bar is open
    When I click on the minimize button
    Then the control bar should be minimized

	# Scenario: Control bar can be maximized
  #   Given the control bar is minimized
  #   When I click on the maximize button
  #   Then the control bar should be maximized

  # Scenario: Time scale changes affect simulation speed
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   When I change the Time Scale to 2.00x
  #   Then the time scale will change and the simulation will run at a different rate
  #   And the range labels will update to 0s and 1s

  # Scenario: Pause simulation can be toggled
  #   Given the simulation is not already paused
  #   When I check the Pause Simulation button
  #   Then the simulation will pause
  #   And the Pause Simulation button will be highlighted

  #   Given the simulation is already paused
  #   When I uncheck the Pause Simulation button
  #   And the simulation will resume

  # Scenario: Show/Hide orbit lines
  #   Given the orbit lines are already showing
  #   When I uncheck the Show Orbit Lines box
  #   Then the orbit lines are hidden
  #   And the background color will change to black

  #   Given the orbit lines are hidden
  #   When I check the Show Orbit Lines box
  #   And the orbit lines are showing
  #   And the background color will change back to white

  # Scenario: Reset camera returns to Free View
  #   Given the control bar is not minimized
  #   When I click Reset Camera
  #   Then the camera will stop following the planet
  #   And the Focus Planet: drop down will show Free View

  # Scenario: Time scale range verification
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   When I change the Time Scale to 10.00x
  #   Then the range labels will update to 0s and 100s

  # Scenario: Rapid time scale adjustment
  #   Given the control bar is not minimized
  #   When I adjust the time scale rapidly by changing it multiple times in quick succession
  #   Then the control bar should handle the changes without UI freezes or errors

  # Scenario: Control bar UI consistency
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   And the Pause Simulation checkbox is unchecked
  #   And the Show Orbit Lines checkbox is unchecked
  #   When I change the Time Scale to 2.00x
  #   Then the control bar should update all UI elements consistently
  #   And no visual glitches should occur

  # Scenario: Edge case - very high time scale
  #   Given the control bar is not minimized
  #   When I change the Time Scale to 10.00x
  #   Then the simulation should continue running normally
  #   And no errors should occur in the console

  # Scenario: Edge case - zero time scale
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   When I change the Time Scale to 0.00x
  #   Then the simulation should stop or pause
  #   And the UI should update to reflect the zero time scale

  # Scenario: State preservation
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   When I minimize the control bar
  #   Then the Time Scale should remain at 1.00x
  #   And the state should be preserved

  #   Given the control bar is minimized
  #   When I maximize the control bar
  #   Then the Time Scale should still be at 1.00x
  #   And the state should be preserved

  # Scenario: Reset to default state
  #   Given the control bar is not minimized
  #   And the Time Scale is at 10.00x
  #   When I click Reset Camera
  #   Then the Time Scale should reset to 1.00x
  #   And the camera should stop following any planet

  # Scenario: Focus on different planets
  #   Given the control bar is not minimized
  #   When I change the Time Scale to 2.00x
  #   Then the focus on Saturn should change
  #   And the orbit lines should update accordingly

  # Scenario: Integration with main app
  #   Given the control bar is not minimized
  #   When I change the Time Scale to 2.00x
  #   Then the main scene should continue running
  #   And the planet animations should continue

  # Scenario: Performance under rapid interactions
  #   Given the control bar is not minimized
  #   And I have changed the time scale multiple times
  #   Then the control bar should not freeze
  #   And the UI should remain responsive

  # Scenario: Cross-browser compatibility
  #   Given the application is loaded in Chrome
  #   And the control bar is visible
  #   When I minimize and maximize the control bar
  #   Then the behavior should be consistent

  # Scenario: Accessibility features
  #   Given the control bar is visible
  #   When I verify that all control elements have proper ARIA labels
  #   Then the control bar should be accessible to screen readers

  # Scenario: Error handling
  #   Given the control bar is visible
  #   When I try to interact with disabled elements
  #   Then the control bar should handle errors gracefully
  #   And no errors should be thrown

  # Scenario: Mobile responsiveness
  #   Given the control bar is visible
  #   When I resize the browser window
  #   Then the control bar should adapt to the new screen size

  # Scenario: Multi-user scenarios
  #   Given the application is running
  #   When multiple users are changing time scale values
  #   Then the state should be synchronized correctly

  # Scenario Outline: Verify specific planet values
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   And the planet Mercury is focused
  #   When I check that the value of planet-select is Mercury
  #   Then the focus on the selected planet should be correct

  #   Examples:
  #     | planet |
  #     | Mercury |
  #     | Venus   |
  #     | Earth   |
  #     | Mars    |
  #     | Jupiter |
  #     | Saturn  |
  #     | Neptune |
  #     | Uranus  |

  # Scenario: Complex interaction sequences
  #   Given the control bar is not minimized
  #   And the Time Scale is at 1.00x
  #   When I change the time scale to 2.00x
  #   And then minimize the control bar
  #   And then change the time scale to 10.00x
  #   Then the control bar should handle the sequence correctly
  #   And the final state should be correct

  # Scenario: Long-running simulation
  #   Given the control bar is not minimized
  #   When I run the simulation for an extended period
  #   Then the control bar should remain stable
  #   And no memory leaks should occur

  # Scenario: State transitions
  #   Given the control bar is not minimized
  #   When I change between different time scales
  #   And then toggle the minimize state
  #   Then the state transitions should be smooth
  #   And no flickering should occur
