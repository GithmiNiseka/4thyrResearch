response_times = [
    1.240, 1.485, 1.378, 1.401, 1.193, 1.422, 1.459, 1.330, 1.401,
    1.573, 1.245, 1.616, 1.186, 1.431, 1.588, 1.387, 1.599, 1.381
]

total_time = sum(response_times)
num_responses = len(response_times)
average_time = total_time / num_responses
response_speed = num_responses / total_time

print(f"Total time: {total_time:.3f} seconds")
print(f"Average response time: {average_time:.3f} seconds")
print(f"Response speed: {response_speed:.3f} responses per second")
